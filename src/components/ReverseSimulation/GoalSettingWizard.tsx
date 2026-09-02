import React, { useState } from 'react';
import { Zap, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { useReverseSimulation } from '../../hooks/useReverseSimulation';

interface GoalSettingWizardProps {
  simulationId: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export const GoalSettingWizard: React.FC<GoalSettingWizardProps> = ({ simulationId, onSuccess, onError }) => {
  const { setGoalSetting, loading, errors } = useReverseSimulation();

  const [formData, setFormData] = useState({
    currentHealth: 50,
    targetHealth: 80,
    timelineMonths: 12,
    budget: 500000,
    priority: 'Balanced',
  });

  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.targetHealth <= formData.currentHealth) {
      onError('Target health must be greater than current health');
      return;
    }

    if (formData.timelineMonths < 3 || formData.timelineMonths > 24) {
      onError('Timeline must be between 3 and 24 months');
      return;
    }

    if (formData.budget <= 0) {
      onError('Budget must be greater than 0');
      return;
    }

    try {
      setSubmitted(true);
      const response = await setGoalSetting({
        simulationId,
        currentHealth: formData.currentHealth,
        targetHealth: formData.targetHealth,
        timelineMonths: formData.timelineMonths,
        budget: formData.budget,
        priority: formData.priority,
      });

      setResult(response);
      onSuccess(response);
    } catch (error: any) {
      onError(error.message || 'Failed to set goal');
    }
  };

  const isLoading = loading['setGoalSetting'] || false;

  if (result && submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <h3 className="text-lg font-bold text-emerald-900">Goal Setting Complete</h3>
        </div>
        <div className="space-y-2 mb-4">
          <p className="text-sm text-emerald-800">
            <strong>Challenge Level:</strong> {result.challengeLevel}/100
          </p>
          <p className="text-sm text-emerald-800">
            <strong>Target Band:</strong> {result.targetBand}
          </p>
          <p className="text-sm text-emerald-800">
            <strong>Created:</strong> {new Date(result.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setResult(null);
            setFormData({
              currentHealth: 50,
              targetHealth: 80,
              timelineMonths: 12,
              budget: 500000,
              priority: 'Balanced',
            });
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
        >
          Start New Goal
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Step 1: Set Your Goal
        </h3>
      </div>

      {/* Current Health */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Current Health Score (0-100)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={formData.currentHealth}
            onChange={(e) => handleInputChange('currentHealth', Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-2xl font-bold text-gray-900 w-16 text-right">{formData.currentHealth}</span>
        </div>
      </div>

      {/* Target Health */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Target Health Score (0-100)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={formData.targetHealth}
            onChange={(e) => handleInputChange('targetHealth', Number(e.target.value))}
            className="flex-1 h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-2xl font-bold text-blue-600 w-16 text-right">{formData.targetHealth}</span>
        </div>
        {formData.targetHealth <= formData.currentHealth && (
          <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Target must be higher than current
          </p>
        )}
      </div>

      {/* Timeline */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Implementation Timeline (3-24 months)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="3"
            max="24"
            value={formData.timelineMonths}
            onChange={(e) => handleInputChange('timelineMonths', Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-2xl font-bold text-gray-900 w-24 text-right">{formData.timelineMonths} mo</span>
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Total Budget (₹)
        </label>
        <input
          type="number"
          value={formData.budget}
          onChange={(e) => handleInputChange('budget', Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg font-semibold text-gray-900"
          min="0"
          step="10000"
        />
        <p className="text-xs text-gray-500 mt-1">
          Monthly budget: ₹{(formData.budget / formData.timelineMonths).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Priority Approach
        </label>
        <select
          value={formData.priority}
          onChange={(e) => handleInputChange('priority', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 font-medium"
        >
          <option value="Balanced">Balanced (Quick wins + Sustainability)</option>
          <option value="Aggressive">Aggressive (Maximum impact)</option>
          <option value="Conservative">Conservative (Minimize risk)</option>
        </select>
      </div>

      {/* Error Display */}
      {errors['setGoalSetting'] && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errors['setGoalSetting']}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || formData.targetHealth <= formData.currentHealth}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Set Goal & Calculate Challenge Level
          </>
        )}
      </button>
    </form>
  );
};

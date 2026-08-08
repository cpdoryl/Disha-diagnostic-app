import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AssessmentConfiguration, ResponseTracker } from '../components/MultiUserAssessment';
import {
  AssessmentConfiguration as ConfigType,
  AssessmentProgress,
  initializeAssessmentProgress,
} from '../lib/multiUserAssessment';
import { ArrowRight, Settings, Activity, CheckCircle2 } from 'lucide-react';

type Stage = 'select' | 'configuration' | 'deployment' | 'analysis';

export function MultiUserAssessmentPage() {
  const { activeSchool } = useAppStore();
  const [stage, setStage] = useState<Stage>('select');
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [progress, setProgress] = useState<AssessmentProgress | null>(null);

  const schoolId = activeSchool?.id || 'unknown';
  const schoolName = activeSchool?.name || 'Unknown School';

  const handleConfigComplete = (newConfig: ConfigType, newProgress: AssessmentProgress) => {
    setConfig(newConfig);
    setProgress(newProgress);
    setStage('deployment');

    // Save to localStorage for demo
    localStorage.setItem(`assessment_config_${schoolId}`, JSON.stringify(newConfig));
    localStorage.setItem(`assessment_progress_${schoolId}`, JSON.stringify(newProgress));
  };

  const handleProgressUpdate = (updatedProgress: AssessmentProgress) => {
    setProgress(updatedProgress);

    // Save to localStorage for demo
    localStorage.setItem(`assessment_progress_${schoolId}`, JSON.stringify(updatedProgress));
  };

  const handleProceedToAnalysis = () => {
    setStage('analysis');
  };

  const handleRestart = () => {
    setStage('configuration');
    setConfig(null);
    setProgress(null);
  };

  const handleNewAssessment = () => {
    setStage('select');
    setConfig(null);
    setProgress(null);
    localStorage.removeItem(`assessment_config_${schoolId}`);
    localStorage.removeItem(`assessment_progress_${schoolId}`);
  };

  // Load saved data if available
  useEffect(() => {
    const savedConfig = localStorage.getItem(`assessment_config_${schoolId}`);
    const savedProgress = localStorage.getItem(`assessment_progress_${schoolId}`);

    if (savedConfig && savedProgress) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        const parsedProgress = JSON.parse(savedProgress);
        setConfig(parsedConfig);
        setProgress(parsedProgress);
        setStage('deployment');
      } catch (error) {
        console.error('Failed to load saved assessment:', error);
      }
    }
  }, [schoolId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">14-Dimension Multilateral Assessment</h1>
        <p className="text-gray-600 mt-2">Multi-stakeholder feedback system with response tracking</p>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between">
          {['select', 'configuration', 'deployment', 'analysis'].map((s, idx) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition ${
                  ['select', 'configuration', 'deployment', 'analysis'].indexOf(stage) >= idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {['select', 'configuration', 'deployment', 'analysis'].indexOf(stage) > idx ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 transition ${
                    ['select', 'configuration', 'deployment', 'analysis'].indexOf(stage) > idx
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Selection</span>
          <span>Configure</span>
          <span>Deploy</span>
          <span>Analyze</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stage 1: Select Assessment Type */}
        {stage === 'select' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Assessment Type</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Multi-User Assessment Card */}
                <div
                  onClick={() => setStage('configuration')}
                  className="border-2 border-blue-200 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition group"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">Multi-User 14D Assessment</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        Track multiple respondents per stakeholder type with response tracking and locking
                      </p>
                      <div className="mt-4 space-y-1 text-xs text-gray-700">
                        <p>✓ Configure expected respondent counts</p>
                        <p>✓ Track real-time response progress</p>
                        <p>✓ Lock assessment when complete</p>
                        <p>✓ Generate comprehensive reports</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-blue-600 font-semibold">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Coming Soon Card */}
                <div className="border-2 border-gray-200 rounded-lg p-6 opacity-50">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Settings className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-600">Single Assessment</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Traditional single respondent assessment (coming soon)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-gray-400 text-sm font-semibold">Coming Soon</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Configuration */}
        {stage === 'configuration' && (
          <AssessmentConfiguration
            schoolId={schoolId}
            schoolName={schoolName}
            onConfigComplete={handleConfigComplete}
            onCancel={() => setStage('select')}
          />
        )}

        {/* Stage 3: Deployment & Response Tracking */}
        {stage === 'deployment' && config && progress && (
          <ResponseTracker
            config={config}
            progress={progress}
            onLockStatusChange={handleProgressUpdate}
            onProceedToAnalysis={handleProceedToAnalysis}
          />
        )}

        {/* Stage 4: Analysis (Placeholder) */}
        {stage === 'analysis' && config && progress && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete & Ready for Analysis</h2>
              <p className="text-gray-600 mb-6">
                Multi-stakeholder assessment locked with {progress.totalActual} respondents. Ready to generate comprehensive diagnostic report.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-blue-900 mb-4">Assessment Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 text-xs font-bold">Teachers</p>
                    <p className="text-2xl font-bold text-blue-600">{progress.actualRespondents.teacher}</p>
                    <p className="text-xs text-blue-600">of {config.expectedRespondents.teacher}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 text-xs font-bold">Parents</p>
                    <p className="text-2xl font-bold text-blue-600">{progress.actualRespondents.parent}</p>
                    <p className="text-xs text-blue-600">of {config.expectedRespondents.parent}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 text-xs font-bold">Students</p>
                    <p className="text-2xl font-bold text-blue-600">{progress.actualRespondents.student}</p>
                    <p className="text-xs text-blue-600">of {config.expectedRespondents.student}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 text-xs font-bold">Admin</p>
                    <p className="text-2xl font-bold text-blue-600">{progress.actualRespondents.admin}</p>
                    <p className="text-xs text-blue-600">of {config.expectedRespondents.admin}</p>
                  </div>
                  <div>
                    <p className="text-green-700 text-xs font-bold">Overall</p>
                    <p className="text-2xl font-bold text-green-600">{progress.totalActual}</p>
                    <p className="text-xs text-green-600">Total Responses</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-green-800">
                  ✓ Assessment data validated and locked. All {progress.totalActual} responses ready for analysis across 14 diagnostic dimensions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRestart}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition order-2 sm:order-1"
                >
                  Edit Configuration
                </button>
                <button
                  onClick={() => {
                    // Navigate to Synthesize stage with assessment data
                    // This would be integrated with the main app router
                    alert('Proceeding to Diagnostic Report Generation...\n\nIntegration with SynthesizeStage pending router configuration.');
                  }}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Generate Diagnostic Report
                </button>
                <button
                  onClick={handleNewAssessment}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition order-3"
                >
                  Start New Assessment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiUserAssessmentPage;

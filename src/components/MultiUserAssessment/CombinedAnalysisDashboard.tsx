import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, ArrowUp } from 'lucide-react';
import { AssessmentProgress } from '../../lib/multiUserAssessment';

interface ObjectiveMetrics {
  academicPerformance?: number;
  studentEnrollment?: number;
  teacherQualification?: number;
  infrastructureRating?: number;
  libraryResources?: number;
  labFacilities?: number;
  studentWellbeingPrograms?: number;
  staffTrainingHours?: number;
  parentEngagementRate?: number;
  financialHealth?: number;
}

interface SubjectiveDimensionScores {
  [dimensionId: string]: {
    average: number; // 1-5 scale
    stakeholder: string;
  }[];
}

interface CombinedAnalysisDashboardProps {
  progress: AssessmentProgress;
  objectiveData: ObjectiveMetrics;
  subjectiveScores: SubjectiveDimensionScores;
}

interface GapAnalysis {
  category: string;
  subjective: number; // normalized to 0-100
  objective: number; // 0-100
  gap: number; // positive = gap exists
  severity: 'critical' | 'warning' | 'good';
  insight: string;
}

export function CombinedAnalysisDashboard({
  progress,
  objectiveData,
  subjectiveScores,
}: CombinedAnalysisDashboardProps) {
  // Calculate normalized scores
  const gapAnalyses = useMemo((): GapAnalysis[] => {
    return [
      {
        category: 'Academic Excellence',
        subjective: calculateDimensionAverage(subjectiveScores, 'academic') * 20, // normalize 1-5 to 0-100
        objective: objectiveData.academicPerformance || 0,
        gap: Math.abs((calculateDimensionAverage(subjectiveScores, 'academic') * 20) - (objectiveData.academicPerformance || 0)),
        severity: getGapSeverity(Math.abs((calculateDimensionAverage(subjectiveScores, 'academic') * 20) - (objectiveData.academicPerformance || 0))),
        insight: 'Perception vs. actual student performance metrics',
      },
      {
        category: 'Infrastructure & Resources',
        subjective: calculateDimensionAverage(subjectiveScores, 'infrastructure') * 20,
        objective: ((objectiveData.infrastructureRating || 0) / 5) * 100,
        gap: Math.abs((calculateDimensionAverage(subjectiveScores, 'infrastructure') * 20) - (((objectiveData.infrastructureRating || 0) / 5) * 100)),
        severity: getGapSeverity(Math.abs((calculateDimensionAverage(subjectiveScores, 'infrastructure') * 20) - (((objectiveData.infrastructureRating || 0) / 5) * 100))),
        insight: 'Facilities perception vs. actual ratings',
      },
      {
        category: 'Staff Development',
        subjective: calculateDimensionAverage(subjectiveScores, 'staff_development') * 20,
        objective: Math.min((objectiveData.staffTrainingHours || 0) / 100 * 100, 100),
        gap: Math.abs((calculateDimensionAverage(subjectiveScores, 'staff_development') * 20) - Math.min((objectiveData.staffTrainingHours || 0) / 100 * 100, 100)),
        severity: getGapSeverity(Math.abs((calculateDimensionAverage(subjectiveScores, 'staff_development') * 20) - Math.min((objectiveData.staffTrainingHours || 0) / 100 * 100, 100))),
        insight: 'Staff satisfaction vs. training investment',
      },
      {
        category: 'Student Wellbeing',
        subjective: calculateDimensionAverage(subjectiveScores, 'student_wellbeing') * 20,
        objective: Math.min((objectiveData.studentWellbeingPrograms || 0) * 10, 100),
        gap: Math.abs((calculateDimensionAverage(subjectiveScores, 'student_wellbeing') * 20) - Math.min((objectiveData.studentWellbeingPrograms || 0) * 10, 100)),
        severity: getGapSeverity(Math.abs((calculateDimensionAverage(subjectiveScores, 'student_wellbeing') * 20) - Math.min((objectiveData.studentWellbeingPrograms || 0) * 10, 100))),
        insight: 'Perceived wellbeing initiatives vs. actual programs',
      },
    ];
  }, [objectiveData, subjectiveScores]);

  const overallGap = useMemo(() => {
    const avgGap = gapAnalyses.reduce((sum, g) => sum + g.gap, 0) / gapAnalyses.length;
    return Math.round(avgGap);
  }, [gapAnalyses]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Subjective Avg Score</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {(gapAnalyses.reduce((sum, g) => sum + g.subjective, 0) / gapAnalyses.length).toFixed(1)}
              </p>
              <p className="text-xs text-blue-700 mt-1">From stakeholder feedback</p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Objective Metrics</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {(gapAnalyses.reduce((sum, g) => sum + g.objective, 0) / gapAnalyses.length).toFixed(1)}
              </p>
              <p className="text-xs text-green-700 mt-1">Actual operational data</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-400 opacity-50" />
          </div>
        </div>

        <div className={`bg-gradient-to-br rounded-lg p-6 border ${ overallGap > 20 ? 'from-red-50 to-red-100 border-red-200' : overallGap > 10 ? 'from-yellow-50 to-yellow-100 border-yellow-200' : 'from-emerald-50 to-emerald-100 border-emerald-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${overallGap > 20 ? 'text-red-600' : overallGap > 10 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                Overall Gap Index
              </p>
              <p className={`text-3xl font-bold mt-1 ${overallGap > 20 ? 'text-red-900' : overallGap > 10 ? 'text-yellow-900' : 'text-emerald-900'}`}>
                {overallGap}%
              </p>
              <p className={`text-xs mt-1 ${overallGap > 20 ? 'text-red-700' : overallGap > 10 ? 'text-yellow-700' : 'text-emerald-700'}`}>
                {overallGap > 20 ? 'Critical gaps exist' : overallGap > 10 ? 'Moderate gaps' : 'Aligned perceptions'}
              </p>
            </div>
            {overallGap > 20 ? (
              <AlertTriangle className="w-12 h-12 text-red-400 opacity-50" />
            ) : overallGap > 10 ? (
              <AlertTriangle className="w-12 h-12 text-yellow-400 opacity-50" />
            ) : (
              <CheckCircle className="w-12 h-12 text-emerald-400 opacity-50" />
            )}
          </div>
        </div>
      </div>

      {/* Gap Analysis Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Gap Analysis: Perception vs Reality
        </h3>

        <div className="space-y-4">
          {gapAnalyses.map((gap, idx) => (
            <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{gap.category}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  gap.severity === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : gap.severity === 'warning'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {gap.severity === 'critical' ? '⚠️ Critical' : gap.severity === 'warning' ? '⚠️ Warning' : '✓ Good'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{gap.insight}</p>

              {/* Comparison Bars */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-blue-700">Stakeholder Perception</span>
                    <span className="text-sm font-bold text-blue-900">{gap.subjective.toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${gap.subjective}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-green-700">Actual Metrics</span>
                    <span className="text-sm font-bold text-green-900">{gap.objective.toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${gap.objective}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-orange-700">Gap Magnitude</span>
                    <span className="text-sm font-bold text-orange-900">{gap.gap.toFixed(1)} points</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        gap.severity === 'critical'
                          ? 'bg-red-500'
                          : gap.severity === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(gap.gap, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Summary */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
          <ArrowUp className="w-5 h-5" />
          Key Findings
        </h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>• Large gaps indicate areas where stakeholder perception significantly differs from operational reality</li>
          <li>• Critical gaps require immediate attention and resource reallocation</li>
          <li>• Positive correlations between subjective and objective data indicate transparent communication</li>
          <li>• Use these insights to prioritize improvement initiatives</li>
        </ul>
      </div>
    </div>
  );
}

function calculateDimensionAverage(subjectiveScores: SubjectiveDimensionScores, dimensionKey: string): number {
  const scores = subjectiveScores[dimensionKey];
  if (!scores || scores.length === 0) return 0;

  const sum = scores.reduce((total, s) => total + s.average, 0);
  return sum / scores.length;
}

function getGapSeverity(gap: number): 'critical' | 'warning' | 'good' {
  if (gap > 20) return 'critical';
  if (gap > 10) return 'warning';
  return 'good';
}

export default CombinedAnalysisDashboard;

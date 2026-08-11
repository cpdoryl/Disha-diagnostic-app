import React, { useMemo } from 'react';
import { Lightbulb, Target, Zap, TrendingUp, Calendar, Users } from 'lucide-react';

interface ObjectiveMetrics {
  academicPerformance?: number;
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
    average: number;
    stakeholder: string;
  }[];
}

interface ActionableInsight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeline: string;
  stakeholders: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  resources: string;
  metrics: string;
}

interface DiagnosticInsightsProps {
  objectiveData: ObjectiveMetrics;
  subjectiveScores: SubjectiveDimensionScores;
}

export function DiagnosticInsights({
  objectiveData,
  subjectiveScores,
}: DiagnosticInsightsProps) {
  const insights = useMemo((): ActionableInsight[] => {
    const actionItems: ActionableInsight[] = [];

    // Academic Performance Insights
    if ((objectiveData.academicPerformance || 0) < 70) {
      actionItems.push({
        title: 'Enhance Academic Performance',
        description: 'Academic performance is below 70%. Implement targeted intervention programs for struggling students and strengthen curriculum delivery.',
        impact: 'high',
        timeline: '2-3 months',
        stakeholders: ['Teachers', 'Students', 'Parents'],
        priority: 'critical',
        resources: 'Additional tutoring programs, remedial classes, curriculum specialist',
        metrics: 'Track student test scores weekly, aim for 75% in 3 months',
      });
    }

    // Teacher Qualification Insights
    if ((objectiveData.teacherQualification || 0) < 60) {
      actionItems.push({
        title: 'Upgrade Teacher Qualifications',
        description: 'Less than 60% of teachers have advanced degrees. Support ongoing professional development and advanced certifications.',
        impact: 'high',
        timeline: '6-12 months',
        stakeholders: ['Teachers', 'Management'],
        priority: 'high',
        resources: 'Scholarship programs, online courses, training budget allocation',
        metrics: 'Increase qualification % by 10% quarterly',
      });
    }

    // Infrastructure Insights
    if ((objectiveData.infrastructureRating || 0) < 3) {
      actionItems.push({
        title: 'Improve Physical Infrastructure',
        description: 'Infrastructure rating is below 3/5. Prioritize facility maintenance and upgrades.',
        impact: 'high',
        timeline: '3-6 months',
        stakeholders: ['Management', 'Students', 'Teachers'],
        priority: 'critical',
        resources: 'Infrastructure budget, maintenance team, construction planning',
        metrics: 'Improve rating to 4/5 through systematic upgrades',
      });
    }

    // Library Resources Insights
    if ((objectiveData.libraryResources || 0) < 1000) {
      actionItems.push({
        title: 'Expand Library Resources',
        description: 'Library has fewer than 1000 resources. Invest in digital and physical resources to support research and learning.',
        impact: 'medium',
        timeline: '4-6 months',
        stakeholders: ['Students', 'Teachers', 'Librarian'],
        priority: 'medium',
        resources: 'Library budget for books and digital subscriptions',
        metrics: 'Increase resources by 500+ items, boost circulation by 30%',
      });
    }

    // Lab Facilities Insights
    if ((objectiveData.labFacilities || 0) < 3) {
      actionItems.push({
        title: 'Enhance Laboratory Facilities',
        description: 'Lab facilities rating is below 3/5. Upgrade equipment and maintain safety standards.',
        impact: 'medium',
        timeline: '3-4 months',
        stakeholders: ['Science Teachers', 'Students', 'Management'],
        priority: 'high',
        resources: 'Lab equipment budget, safety compliance specialist',
        metrics: 'Achieve 4.5/5 rating with 100% safety compliance',
      });
    }

    // Staff Training Insights
    if ((objectiveData.staffTrainingHours || 0) < 100) {
      actionItems.push({
        title: 'Increase Staff Training Hours',
        description: 'Annual staff training is below 100 hours. Implement structured professional development programs.',
        impact: 'medium',
        timeline: '2-3 months',
        stakeholders: ['All Staff', 'Management'],
        priority: 'high',
        resources: 'Training budget, external experts, online platforms',
        metrics: 'Achieve 150+ training hours annually per staff member',
      });
    }

    // Wellbeing Programs Insights
    if ((objectiveData.studentWellbeingPrograms || 0) < 5) {
      actionItems.push({
        title: 'Establish Student Wellbeing Programs',
        description: 'Limited wellbeing programs detected. Create comprehensive mental health and wellness support systems.',
        impact: 'high',
        timeline: '3-4 months',
        stakeholders: ['Counselors', 'Students', 'Parents', 'Teachers'],
        priority: 'high',
        resources: 'School counselor, wellness coordinator, mental health resources',
        metrics: 'Launch 5+ wellbeing programs, 80% student participation',
      });
    }

    // Parent Engagement Insights
    if ((objectiveData.parentEngagementRate || 0) < 50) {
      actionItems.push({
        title: 'Boost Parent Engagement',
        description: 'Parent engagement rate is below 50%. Implement structured communication and involvement strategies.',
        impact: 'medium',
        timeline: '2-3 months',
        stakeholders: ['Parents', 'Teachers', 'Management'],
        priority: 'medium',
        resources: 'Communication platforms, parent programs, events',
        metrics: 'Increase engagement to 75% through regular communication',
      });
    }

    // Financial Health Insights
    if ((objectiveData.financialHealth || 0) < 3) {
      actionItems.push({
        title: 'Strengthen Financial Health',
        description: 'Financial health rating is low. Review budgeting and resource allocation strategies.',
        impact: 'high',
        timeline: '1-2 months',
        stakeholders: ['Finance Team', 'Management', 'Trustees'],
        priority: 'critical',
        resources: 'Financial auditor, budget planning specialist',
        metrics: 'Improve financial rating to 4/5 through better planning',
      });
    }

    return actionItems.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [objectiveData]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      default:
        return 'bg-green-100 border-green-300 text-green-900';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <Zap className="w-5 h-5 text-orange-600" />;
      default:
        return <Target className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
          <Lightbulb className="w-6 h-6" />
          Actionable Improvement Plan
        </h2>
        <p className="text-indigo-700">
          Based on combined subjective feedback and objective operational data, here are prioritized recommendations for school improvement.
        </p>
      </div>

      {/* Insights Grid */}
      {insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`border-l-4 rounded-lg p-5 transition hover:shadow-md ${getPriorityColor(insight.priority)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getImpactIcon(insight.impact)}
                    <h3 className="text-lg font-bold">{insight.title}</h3>
                  </div>
                  <p className="text-sm opacity-90">{insight.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    insight.priority === 'critical'
                      ? 'bg-red-200 text-red-700'
                      : insight.priority === 'high'
                      ? 'bg-orange-200 text-orange-700'
                      : insight.priority === 'medium'
                      ? 'bg-yellow-200 text-yellow-700'
                      : 'bg-green-200 text-green-700'
                  }`}>
                    {insight.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                  <div>
                    <p className="font-semibold">Timeline</p>
                    <p className="opacity-90">{insight.timeline}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                  <div>
                    <p className="font-semibold">Stakeholders</p>
                    <p className="opacity-90">{insight.stakeholders.join(', ')}</p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="font-semibold mb-1">Required Resources</p>
                  <p className="opacity-90">{insight.resources}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="font-semibold mb-1">Success Metrics</p>
                  <p className="opacity-90">{insight.metrics}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-green-900 mb-1">Excellent Performance</h3>
          <p className="text-green-700">
            All metrics are performing well. Continue monitoring and maintain current standards.
          </p>
        </div>
      )}

      {/* Summary Statistics */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {insights.filter(i => i.priority === 'critical').length}
            </p>
            <p className="text-sm text-red-700 font-medium">Critical Issues</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {insights.filter(i => i.priority === 'high').length}
            </p>
            <p className="text-sm text-orange-700 font-medium">High Priority</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {insights.filter(i => i.priority === 'medium').length}
            </p>
            <p className="text-sm text-yellow-700 font-medium">Medium Priority</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round((insights.filter(i => i.priority === 'critical' || i.priority === 'high').length / Math.max(insights.length, 1)) * 100)}%
            </p>
            <p className="text-sm text-blue-700 font-medium">Urgent Action</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiagnosticInsights;

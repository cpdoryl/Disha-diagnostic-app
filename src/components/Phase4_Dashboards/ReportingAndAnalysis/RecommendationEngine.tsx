/**
 * Recommendation Engine Component
 * Phase 4: Days 12-14
 *
 * Tier-based recommendations with action plans
 */

import React, { useMemo, useState } from 'react';
import { RecommendationResult } from 'src/lib/phase4/useRealTimePhase3Data';

interface RecommendationViewProps {
  recommendations?: RecommendationResult;
  loading?: boolean;
  onExportPDF?: () => void;
}

const TIER_CONFIG = {
  1: { color: '#D32F2F', bgColor: '#FFEBEE', label: 'Tier 1: Immediate Action', urgency: 'CRITICAL' },
  2: { color: '#F57C00', bgColor: '#FFF3E0', label: 'Tier 2: High Priority', urgency: 'HIGH' },
  3: { color: '#FBC02D', bgColor: '#FFFDE7', label: 'Tier 3: Medium Priority', urgency: 'MEDIUM' },
};

export const RecommendationEngine: React.FC<RecommendationViewProps> = ({
  recommendations,
  loading = false,
  onExportPDF,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Generate recommendations from data or use sample
  const recs = useMemo(() => {
    if (recommendations?.recommendations && recommendations.recommendations.length > 0) {
      return recommendations.recommendations;
    }

    // Sample recommendations
    return [
      {
        dimensionId: 'D1',
        gapId: 'gap-001',
        tier: 1,
        recommendation: 'Implement rigorous curriculum framework and quality assurance process',
        rationale: 'Critical gap between perception (81) and reality (72) in Academic Reputation. Stakeholders expect higher academic standards.',
        actions: [
          'Review and update curriculum aligned with CBSE guidelines',
          'Establish monthly quality assurance audits',
          'Train teachers on new assessment methodology',
        ],
        successMetrics: [
          'Student average score increase by 8%',
          'Curriculum coverage 100%',
          'Quality audit pass rate > 90%',
        ],
        timelineWeeks: 4,
        estimatedImpact: 15,
      },
      {
        dimensionId: 'D2',
        gapId: 'gap-002',
        tier: 2,
        recommendation: 'Develop comprehensive teacher welfare and professional development program',
        rationale: 'High gap (10 points) indicates teachers feel undervalued. Need structured development opportunities.',
        actions: [
          'Create career progression framework',
          'Launch monthly professional development workshops',
          'Implement peer mentoring program',
        ],
        successMetrics: [
          'Teacher satisfaction score increase to 80+',
          'Professional development hours per teacher: 40+',
          'Teacher retention rate > 95%',
        ],
        timelineWeeks: 8,
        estimatedImpact: 12,
      },
      {
        dimensionId: 'D4',
        gapId: 'gap-003',
        tier: 1,
        recommendation: 'Establish structured parent engagement and communication SLA',
        rationale: 'Largest gap (18 points) in parent engagement. Parents expect but not receiving regular communication.',
        actions: [
          'Create parent communication schedule (weekly updates)',
          'Implement parent portal for real-time updates',
          'Establish quarterly parent-teacher conferences',
        ],
        successMetrics: [
          'Parent satisfaction score: 85+',
          'Portal adoption rate: 80%+',
          'Communication response time: < 24 hours',
        ],
        timelineWeeks: 3,
        estimatedImpact: 18,
      },
    ];
  }, [recommendations]);

  // Group by tier
  const recsByTier = useMemo(() => {
    return {
      1: recs.filter((r) => r.tier === 1),
      2: recs.filter((r) => r.tier === 2),
      3: recs.filter((r) => r.tier === 3),
    };
  }, [recs]);

  // Calculate impact summary
  const impactSummary = useMemo(() => {
    const totalImpact = recs.reduce((sum, r) => sum + r.estimatedImpact, 0);
    const avgTimelineWeeks = recs.length > 0 ? Math.ceil(recs.reduce((sum, r) => sum + r.timelineWeeks, 0) / recs.length) : 0;

    return {
      totalRecommendations: recs.length,
      totalEstimatedImpact: totalImpact,
      avgTimelineWeeks,
    };
  }, [recs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Recommendations</h1>
          <p className="text-gray-600 mt-2">AI-Powered Diagnostic Recommendations</p>
        </div>
        {onExportPDF && (
          <button
            onClick={onExportPDF}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            📄 Export as PDF
          </button>
        )}
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Recommendations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{impactSummary.totalRecommendations}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Estimated Total Impact</p>
          <p className="text-3xl font-bold text-green-600 mt-2">+{impactSummary.totalEstimatedImpact}</p>
          <p className="text-xs text-gray-500 mt-1">percentage point improvement</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Average Timeline</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{impactSummary.avgTimelineWeeks}w</p>
          <p className="text-xs text-gray-500 mt-1">weeks to implement</p>
        </div>
      </div>

      {/* Tier-based Recommendations */}
      {Object.entries(TIER_CONFIG).map(([tier, config]) => {
        const tierRecs = recsByTier[tier as keyof typeof recsByTier];
        const tierNum = parseInt(tier);

        return (
          <div key={tier} className="space-y-3">
            <div
              className="flex items-center gap-3 p-4 rounded-lg"
              style={{ backgroundColor: config.bgColor, borderLeft: `4px solid ${config.color}` }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: config.color }}
              >
                {tier}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{config.label}</h2>
                <p className="text-sm text-gray-600">{tierRecs.length} recommendations</p>
              </div>
            </div>

            {/* Recommendation Cards */}
            {tierRecs.map((rec, idx) => (
              <div
                key={`${tier}-${idx}`}
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  setExpandedId(expandedId === `${tier}-${idx}` ? null : `${tier}-${idx}`)
                }
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.urgency}
                      </span>
                      <span className="text-sm font-mono text-gray-600">{rec.dimensionId}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{rec.recommendation}</h3>
                    <p className="text-sm text-gray-600 mt-2">{rec.rationale}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm text-gray-600 font-medium">Est. Impact</p>
                    <p className="text-2xl font-bold text-green-600">+{rec.estimatedImpact}</p>
                    <p className="text-xs text-gray-500">{rec.timelineWeeks} weeks</p>
                  </div>
                </div>

                {/* Expandable Details */}
                {expandedId === `${tier}-${idx}` && (
                  <div className="border-t border-gray-200 mt-4 pt-4 space-y-4">
                    {/* Actions */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🎯 Action Items</h4>
                      <ul className="space-y-1">
                        {rec.actions.map((action, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-2">
                            <span className="font-bold text-gray-400">{i + 1}.</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Success Metrics */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📊 Success Metrics</h4>
                      <ul className="space-y-1">
                        {rec.successMetrics.map((metric, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-2">
                            <span className="font-bold text-green-600">✓</span>
                            <span>{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Timeline & Impact */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600 font-medium">TIMELINE</p>
                        <p className="text-lg font-bold text-gray-900">{rec.timelineWeeks} weeks</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">EXPECTED IMPACT</p>
                        <p className="text-lg font-bold text-green-600">+{rec.estimatedImpact} pts</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer - Collapse/Expand hint */}
                <div className="text-xs text-blue-600 font-medium mt-2">
                  {expandedId === `${tier}-${idx}` ? '▼ Hide Details' : '▶ Show Details'}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Implementation Roadmap */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Recommended Implementation Roadmap</h3>
        <div className="space-y-3">
          {recsByTier[1].slice(0, 2).map((rec) => (
            <div key={rec.gapId} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Days 0-{rec.timelineWeeks * 7}: {rec.recommendation}</p>
                <p className="text-sm text-gray-600 mt-1">{rec.actions[0]}</p>
              </div>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-bold">
                CRITICAL
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
        <p className="font-semibold mb-2">📌 Next Steps</p>
        <ul className="space-y-1 text-xs">
          <li>• Review recommendations with school leadership</li>
          <li>• Prioritize Tier 1 actions for immediate implementation</li>
          <li>• Allocate resources and assign action owners</li>
          <li>• Set monthly review checkpoints for progress tracking</li>
          <li>• Schedule 90-day reassessment to measure impact</li>
        </ul>
      </div>
    </div>
  );
};

export default RecommendationEngine;

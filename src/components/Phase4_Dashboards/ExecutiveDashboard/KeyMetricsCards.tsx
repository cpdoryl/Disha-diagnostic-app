/**
 * Key Metrics Cards Component
 * Phase 4: Executive Dashboard
 *
 * Displays KPI summary cards:
 * - Total Dimensions
 * - Critical Gaps
 * - Blind Spots
 * - Action Items
 * - Overall Gap Score
 * - Respondent Count
 */

import React, { useMemo } from 'react';
import {
  CalculationResult,
  GapAnalysisResult,
  Recommendation,
} from 'src/lib/phase4/useRealTimePhase3Data';

interface KeyMetricsCardsProps {
  calculationResult: CalculationResult | null;
  gapAnalysisResult: GapAnalysisResult | null;
  recommendations: Recommendation[];
  loading?: boolean;
}

interface MetricCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'stable';
  };
}

export const KeyMetricsCards: React.FC<KeyMetricsCardsProps> = ({
  calculationResult,
  gapAnalysisResult,
  recommendations,
  loading = false,
}) => {
  // Calculate metrics
  const metrics = useMemo((): MetricCard[] => {
    const cards: MetricCard[] = [];

    if (calculationResult) {
      // Total Dimensions
      cards.push({
        label: 'Total Dimensions',
        value: calculationResult.metricsCovered,
        icon: '📊',
        color: 'bg-blue-50 border-blue-200',
      });

      // Overall Gap Score
      cards.push({
        label: 'Overall Gap Score',
        value: `${calculationResult.overallGap.toFixed(1)}/100`,
        icon: '📈',
        color: 'bg-purple-50 border-purple-200',
        trend: {
          value: `${Math.abs(calculationResult.overallGap - 50) > 25 ? '↑' : '↓'}`,
          direction: calculationResult.overallGap > 50 ? 'up' : 'down',
        },
      });

      // Respondent Count
      cards.push({
        label: 'Total Respondents',
        value: calculationResult.respondentCount,
        icon: '👥',
        color: 'bg-green-50 border-green-200',
      });
    }

    if (gapAnalysisResult) {
      // Critical Gaps
      cards.push({
        label: 'Critical Gaps',
        value: gapAnalysisResult.criticalGaps,
        icon: '🔴',
        color: 'bg-red-50 border-red-200',
        trend:
          gapAnalysisResult.criticalGaps > 0
            ? {
                value: 'HIGH',
                direction: 'up',
              }
            : undefined,
      });

      // Blind Spots
      cards.push({
        label: 'Blind Spots Detected',
        value: gapAnalysisResult.blindSpots,
        icon: '⚠️',
        color: 'bg-orange-50 border-orange-200',
      });
    }

    // Action Items
    cards.push({
      label: 'Action Items',
      value: recommendations.length,
      icon: '📋',
      color: 'bg-yellow-50 border-yellow-200',
    });

    return cards;
  }, [calculationResult, gapAnalysisResult, recommendations]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className={`${metric.color} border-l-4 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-2">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                {metric.trend && (
                  <span
                    className={`text-lg font-semibold ${
                      metric.trend.direction === 'up' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {metric.trend.value}
                  </span>
                )}
              </div>
            </div>
            <div className="text-4xl opacity-50">{metric.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KeyMetricsCards;

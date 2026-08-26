/**
 * Phase 6: Data Audit Dashboard
 * Real-time monitoring of data collection progress and quality
 */

import React, { useState, useEffect } from 'react';
import { getCycleMetrics, generateDataAuditReport } from '@/lib/phase5/metricsService';
import { getSurveyResponses, calculateResponseRate } from '@/lib/phase5/surveyService';

// ============================================================================
// TYPES
// ============================================================================

interface DimensionCoverageStats {
  dimensionId: number;
  dimensionName: string;
  totalMetrics: number;
  filledMetrics: number;
  verifiedMetrics: number;
  coverage: number;
  lastUpdated: Date | null;
  qualityScore: number;
}

interface DataAuditStats {
  schoolId: string;
  cycleId: string;
  generatedAt: Date;
  totalMetrics: number;
  filledMetrics: number;
  verifiedMetrics: number;
  overallCoverage: number;
  overallQualityScore: number;
  perceptionResponseRate: number;
  dimensions: DimensionCoverageStats[];
  warnings: string[];
  lastUpdatedMetric: Date | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

interface DataAuditDashboardProps {
  schoolId: string;
  cycleId: string;
  expectedRespondents?: number;
}

export const DataAuditDashboard: React.FC<DataAuditDashboardProps> = ({
  schoolId,
  cycleId,
  expectedRespondents = 100,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DataAuditStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAuditData();

    // Refresh every 30 seconds
    const interval = setInterval(loadAuditData, 30000);
    return () => clearInterval(interval);
  }, [schoolId, cycleId]);

  const loadAuditData = async () => {
    try {
      setError('');

      const [metricsData, surveyResponses] = await Promise.all([
        getCycleMetrics(schoolId, cycleId),
        getSurveyResponses(schoolId, cycleId),
      ]);

      // Calculate metrics stats
      let totalMetrics = 0;
      let filledMetrics = 0;
      let verifiedMetrics = 0;
      let latestUpdated: Date | null = null;
      const dimensions: DimensionCoverageStats[] = [];

      // Process each dimension
      for (let i = 1; i <= 14; i++) {
        const dimMetrics = metricsData.find((m) => m.dimensionId === i)?.metrics || [];
        const filled = dimMetrics.filter((m) => m.value !== undefined && m.value !== '').length;
        const verified = dimMetrics.filter((m) => m.isVerified).length;

        // Get dimension name
        const dimNames: Record<number, string> = {
          1: 'Academic Performance & Learning Outcomes',
          2: 'Curriculum & Pedagogy Quality',
          3: 'Teacher Quality, Development & Retention',
          4: 'Student Wellbeing & Mental Health',
          5: 'Student Discipline & Behavior',
          6: 'Infrastructure & Facilities',
          7: 'Safety & Security',
          8: 'Parent Satisfaction & Engagement',
          9: 'Student Satisfaction & Engagement',
          10: 'Leadership & Governance',
          11: 'Financial Health & Sustainability',
          12: 'Admissions, Enrollment & Market Position',
          13: 'Technology & Digital Readiness',
          14: 'Co-curricular, Extracurricular & Holistic Development',
        };

        // Calculate quality score for dimension
        const qualityScore = calculateDimensionQuality(dimMetrics);

        // Track latest update
        if (dimMetrics.length > 0) {
          const latest = new Date(
            Math.max(...dimMetrics.map((m) => new Date(m.submittedAt).getTime()))
          );
          if (!latestUpdated || latest > latestUpdated) {
            latestUpdated = latest;
          }
        }

        dimensions.push({
          dimensionId: i,
          dimensionName: dimNames[i] || `Dimension ${i}`,
          totalMetrics: dimMetrics.length,
          filledMetrics: filled,
          verifiedMetrics: verified,
          coverage: dimMetrics.length > 0 ? Math.round((filled / dimMetrics.length) * 100) : 0,
          lastUpdated: dimMetrics.length > 0 ? new Date(Math.max(...dimMetrics.map((m) => new Date(m.submittedAt).getTime()))) : null,
          qualityScore,
        });

        totalMetrics += dimMetrics.length;
        filledMetrics += filled;
        verifiedMetrics += verified;
      }

      // Calculate perception response rate
      const responseRate = await calculateResponseRate(schoolId, cycleId, expectedRespondents);

      // Generate warnings
      const warnings: string[] = [];
      const underCoverage = dimensions.filter((d) => d.coverage < 50);
      if (underCoverage.length > 0) {
        warnings.push(
          `${underCoverage.length} dimensions have <50% coverage: ${underCoverage
            .map((d) => `D${d.dimensionId}`)
            .join(', ')}`
        );
      }

      const lowQuality = dimensions.filter((d) => d.qualityScore < 60);
      if (lowQuality.length > 0) {
        warnings.push(`${lowQuality.length} dimensions have low quality scores (<60)`);
      }

      if (responseRate.responseRate < 50) {
        warnings.push(`Low survey response rate: ${responseRate.responseRate}%`);
      }

      const overallCoverage = totalMetrics > 0 ? Math.round((filledMetrics / totalMetrics) * 100) : 0;
      const overallQualityScore = Math.round(
        dimensions.reduce((sum, d) => sum + d.qualityScore, 0) / 14
      );

      setStats({
        schoolId,
        cycleId,
        generatedAt: new Date(),
        totalMetrics,
        filledMetrics,
        verifiedMetrics,
        overallCoverage,
        overallQualityScore,
        perceptionResponseRate: responseRate.responseRate,
        dimensions,
        warnings,
        lastUpdatedMetric: latestUpdated,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDimensionQuality = (metrics: any[]): number => {
    if (metrics.length === 0) return 0;

    const filled = metrics.filter((m) => m.value !== undefined && m.value !== '').length;
    const verified = metrics.filter((m) => m.isVerified).length;
    const quality = ((filled * 50 + verified * 50) / (metrics.length * 100)) * 100;

    return Math.round(quality);
  };

  const getQualityColor = (score: number): string => {
    if (score >= 80) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getCoverageColor = (coverage: number): string => {
    if (coverage === 100) return 'from-green-500 to-green-600';
    if (coverage >= 75) return 'from-blue-500 to-blue-600';
    if (coverage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading audit data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-semibold">Error loading audit data</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-gray-600 text-center py-8">No data available</div>;
  }

  // ========================================================================
  // RENDER DASHBOARD
  // ========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">Data Audit Dashboard</h1>
            <p className="text-blue-100 mt-1">Real-time monitoring of data collection progress</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Last updated</p>
            <p className="font-mono text-sm">
              {stats.generatedAt.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-xs text-gray-600 font-semibold mb-1">OVERALL COVERAGE</p>
          <p className="text-3xl font-bold text-blue-600">{stats.overallCoverage}%</p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.filledMetrics} of {stats.totalMetrics} metrics
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-xs text-gray-600 font-semibold mb-1">QUALITY SCORE</p>
          <p className="text-3xl font-bold text-green-600">{stats.overallQualityScore}/100</p>
          <p className="text-xs text-gray-600 mt-2">All dimensions</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-xs text-gray-600 font-semibold mb-1">VERIFIED METRICS</p>
          <p className="text-3xl font-bold text-purple-600">{stats.verifiedMetrics}</p>
          <p className="text-xs text-gray-600 mt-2">
            {Math.round((stats.verifiedMetrics / stats.totalMetrics) * 100)}% verified
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
          <p className="text-xs text-gray-600 font-semibold mb-1">SURVEY RESPONSES</p>
          <p className="text-3xl font-bold text-orange-600">{stats.perceptionResponseRate}%</p>
          <p className="text-xs text-gray-600 mt-2">Response rate</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <p className="text-xs text-gray-600 font-semibold mb-1">WARNINGS</p>
          <p className="text-3xl font-bold text-red-600">{stats.warnings.length}</p>
          <p className="text-xs text-gray-600 mt-2">Active alerts</p>
        </div>
      </div>

      {/* Warnings */}
      {stats.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="font-semibold text-yellow-800 mb-2">⚠️ Active Alerts</p>
          <ul className="space-y-1">
            {stats.warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-yellow-700">• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Dimension Coverage Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dimension Coverage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {stats.dimensions.map((dim) => (
            <div key={dim.dimensionId} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
              {/* Coverage Bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${getCoverageColor(dim.coverage)}`} />

              {/* Content */}
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-800">D{dim.dimensionId}</p>
                    <p className="text-xs text-gray-600 line-clamp-1">{dim.dimensionName}</p>
                  </div>
                  <div className={`text-xs font-bold px-2 py-0.5 rounded border ${getQualityColor(dim.qualityScore)}`}>
                    {dim.qualityScore}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Filled</span>
                    <span className="font-semibold text-gray-800">
                      {dim.filledMetrics}/{dim.totalMetrics}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full"
                      style={{ width: `${dim.coverage}%` }}
                    />
                  </div>
                </div>

                {/* Verified Badge */}
                {dim.verifiedMetrics > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
                    <p className="text-green-700 font-semibold">✓ {dim.verifiedMetrics} verified</p>
                  </div>
                )}

                {/* Last Updated */}
                {dim.lastUpdated && (
                  <div className="mt-1 text-xs text-gray-500">
                    <p>{Math.round((Date.now() - dim.lastUpdated.getTime()) / 60000)}m ago</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Coverage by Dimension</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Dimension</th>
                <th className="px-4 py-2 text-center text-gray-700 font-semibold">Total</th>
                <th className="px-4 py-2 text-center text-gray-700 font-semibold">Filled</th>
                <th className="px-4 py-2 text-center text-gray-700 font-semibold">Verified</th>
                <th className="px-4 py-2 text-center text-gray-700 font-semibold">Coverage</th>
                <th className="px-4 py-2 text-center text-gray-700 font-semibold">Quality</th>
                <th className="px-4 py-2 text-center text-gray-700 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {stats.dimensions.map((dim) => (
                <tr key={dim.dimensionId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-800">D{dim.dimensionId}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{dim.dimensionName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{dim.totalMetrics}</td>
                  <td className="px-4 py-3 text-center font-semibold text-blue-600">
                    {dim.filledMetrics}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-green-600">
                    {dim.verifiedMetrics}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-xs">
                      {dim.coverage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full font-semibold text-xs border ${getQualityColor(
                        dim.qualityScore
                      )}`}
                    >
                      {dim.qualityScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-600">
                    {dim.lastUpdated
                      ? Math.round((Date.now() - dim.lastUpdated.getTime()) / 60000) + 'm ago'
                      : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataAuditDashboard;

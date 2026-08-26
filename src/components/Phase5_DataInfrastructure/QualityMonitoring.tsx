/**
 * Phase 6: Quality Monitoring & Alerts
 * Real-time data quality detection, outlier warnings, and health indicators
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface DataQualityAlert {
  id: string;
  type: 'OUTLIER' | 'STALE' | 'MISSING' | 'INCONSISTENT' | 'ANOMALY';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  dimensionId: number;
  dimensionName: string;
  metricId: string;
  message: string;
  value?: number;
  expectedRange?: { min: number; max: number };
  lastUpdated: Date;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

interface MetricQualityScore {
  metricId: string;
  metricName: string;
  dimensionId: number;
  score: number;
  factors: {
    completeness: number;
    recency: number;
    consistency: number;
    outlierFree: boolean;
  };
}

interface DimensionQualityHealth {
  dimensionId: number;
  dimensionName: string;
  overallHealth: number;
  metricScores: MetricQualityScore[];
  activeAlerts: number;
  lastAudit: Date;
}

interface QualityMonitoringData {
  schoolId: string;
  cycleId: string;
  generatedAt: Date;
  overallQualityScore: number;
  qualityTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  activeAlerts: DataQualityAlert[];
  dimensionHealth: DimensionQualityHealth[];
  statistics: {
    totalMetrics: number;
    goodQuality: number;
    fairQuality: number;
    poorQuality: number;
    outlierCount: number;
    staleCount: number;
  };
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

const generateQualityAlerts = (): DataQualityAlert[] => {
  return [
    {
      id: 'alert-001',
      type: 'OUTLIER',
      severity: 'CRITICAL',
      dimensionId: 1,
      dimensionName: 'Academic Quality',
      metricId: '1a',
      message: 'Board Exam Pass Rate (95%) is 2.5σ above historical average (78%)',
      value: 95,
      expectedRange: { min: 70, max: 85 },
      lastUpdated: new Date(Date.now() - 3600000),
      status: 'ACTIVE',
    },
    {
      id: 'alert-002',
      type: 'STALE',
      severity: 'WARNING',
      dimensionId: 3,
      dimensionName: 'Teacher Capability',
      metricId: '3c',
      message: 'Teacher Professional Development Hours not updated for 8 days',
      lastUpdated: new Date(Date.now() - 86400000 * 8),
      status: 'ACTIVE',
    },
    {
      id: 'alert-003',
      type: 'MISSING',
      severity: 'WARNING',
      dimensionId: 6,
      dimensionName: 'Infrastructure',
      metricId: '6b',
      message: 'Internet Bandwidth metric has no data source specified',
      lastUpdated: new Date(Date.now() - 172800000),
      status: 'ACTIVE',
    },
    {
      id: 'alert-004',
      type: 'INCONSISTENT',
      severity: 'INFO',
      dimensionId: 2,
      dimensionName: 'Equity & Inclusion',
      metricId: '2d',
      message: 'Gender ratio differs by 15% from previous cycle',
      value: 52,
      expectedRange: { min: 48, max: 52 },
      lastUpdated: new Date(Date.now() - 7200000),
      status: 'ACKNOWLEDGED',
    },
    {
      id: 'alert-005',
      type: 'ANOMALY',
      severity: 'INFO',
      dimensionId: 5,
      dimensionName: 'School Safety',
      metricId: '5a',
      message: 'Incident Rate shows sudden spike (15 incidents vs avg 3/month)',
      value: 15,
      expectedRange: { min: 0, max: 5 },
      lastUpdated: new Date(Date.now() - 14400000),
      status: 'ACTIVE',
    },
  ];
};

const generateDimensionHealth = (): DimensionQualityHealth[] => {
  const dimensionNames = [
    'Academic Quality',
    'Equity & Inclusion',
    'Teacher Capability',
    'Student Wellbeing',
    'School Safety',
    'Infrastructure',
    'Family Engagement',
    'Leadership',
    'Governance',
    'Financial Health',
    'Digital Readiness',
    'Community Partnerships',
    'Sustainability',
    'Innovation',
  ];

  return dimensionNames.map((name, idx) => {
    const baseHealth = 60 + Math.random() * 35;
    const metricScores: MetricQualityScore[] = [];

    // Generate 4-6 metrics per dimension
    const metricCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < metricCount; i++) {
      const completeness = 70 + Math.random() * 30;
      const recency = 80 + Math.random() * 20;
      const consistency = 65 + Math.random() * 35;
      const score = (completeness * 0.4 + recency * 0.3 + consistency * 0.3) / 100 * 100;

      metricScores.push({
        metricId: `${idx + 1}${String.fromCharCode(97 + i)}`,
        metricName: `Metric ${String.fromCharCode(97 + i).toUpperCase()}`,
        dimensionId: idx + 1,
        score: Math.round(score),
        factors: {
          completeness: Math.round(completeness),
          recency: Math.round(recency),
          consistency: Math.round(consistency),
          outlierFree: Math.random() > 0.15,
        },
      });
    }

    return {
      dimensionId: idx + 1,
      dimensionName: name,
      overallHealth: Math.round(baseHealth),
      metricScores,
      activeAlerts: Math.floor(Math.random() * 3),
      lastAudit: new Date(Date.now() - Math.random() * 432000000),
    };
  });
};

// ============================================================================
// COMPONENT
// ============================================================================

interface QualityMonitoringProps {
  schoolId: string;
  cycleId: string;
}

export const QualityMonitoring: React.FC<QualityMonitoringProps> = ({ schoolId, cycleId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<QualityMonitoringData | null>(null);
  const [error, setError] = useState('');
  const [expandedDimension, setExpandedDimension] = useState<number | null>(1);
  const [filterAlerts, setFilterAlerts] = useState<DataQualityAlert['type'][]>([
    'OUTLIER',
    'STALE',
    'MISSING',
    'INCONSISTENT',
    'ANOMALY',
  ]);

  useEffect(() => {
    loadQualityData();

    // Auto-refresh every 90 seconds
    const interval = setInterval(loadQualityData, 90000);
    return () => clearInterval(interval);
  }, [schoolId, cycleId]);

  const loadQualityData = async () => {
    try {
      setError('');

      const alerts = generateQualityAlerts();
      const health = generateDimensionHealth();
      const stats = {
        totalMetrics: 60,
        goodQuality: 38,
        fairQuality: 16,
        poorQuality: 6,
        outlierCount: 3,
        staleCount: 4,
      };

      const overallScore = (stats.goodQuality * 100 + stats.fairQuality * 60 + stats.poorQuality * 20) / stats.totalMetrics;

      setData({
        schoolId,
        cycleId,
        generatedAt: new Date(),
        overallQualityScore: Math.round(overallScore),
        qualityTrend: 'IMPROVING',
        activeAlerts: alerts,
        dimensionHealth: health,
        statistics: stats,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quality data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading quality monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-semibold">Error loading quality data</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-gray-600 text-center py-8">No quality data available</div>;
  }

  const activeAlerts = data.activeAlerts.filter((a) => filterAlerts.includes(a.type));
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'CRITICAL');
  const warningAlerts = activeAlerts.filter((a) => a.severity === 'WARNING');

  // ========================================================================
  // RENDER MONITORING
  // ========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Data Quality Monitoring</h1>
            <p className="text-orange-100 mt-1">Real-time quality checks and anomaly detection</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Updated</p>
            <p className="font-mono text-sm">{data.generatedAt.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Overall Quality Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="font-semibold text-gray-800 mb-2">Overall Quality Score</p>
          <div className="mb-4">
            <p className="text-4xl font-bold text-orange-600">{data.overallQualityScore}</p>
            <p className="text-sm text-gray-600 mt-1">/100</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                data.overallQualityScore >= 80
                  ? 'bg-green-500'
                  : data.overallQualityScore >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${data.overallQualityScore}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {data.qualityTrend === 'IMPROVING' && '📈 Quality Improving'}
            {data.qualityTrend === 'STABLE' && '➡️ Quality Stable'}
            {data.qualityTrend === 'DECLINING' && '📉 Quality Declining'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="font-semibold text-gray-800 mb-2">Active Alerts</p>
          <div className="mb-4">
            <p className="text-4xl font-bold text-red-600">{activeAlerts.length}</p>
            <p className="text-sm text-gray-600 mt-1">
              {criticalAlerts.length} critical · {warningAlerts.length} warning
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Outliers:</span>
              <span className="font-bold text-gray-800">{data.statistics.outlierCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stale Data:</span>
              <span className="font-bold text-gray-800">{data.statistics.staleCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="font-semibold text-gray-800 mb-2">Metric Coverage</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Good Quality</span>
              <span className="font-bold text-green-600">{data.statistics.goodQuality}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Fair Quality</span>
              <span className="font-bold text-yellow-600">{data.statistics.fairQuality}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Poor Quality</span>
              <span className="font-bold text-red-600">{data.statistics.poorQuality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {activeAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">🚨 Active Alerts & Anomalies</h2>
            <p className="text-sm text-gray-600">{activeAlerts.length} total</p>
          </div>

          {/* Alert Type Filter */}
          <div className="mb-4 flex gap-2 flex-wrap">
            {['OUTLIER', 'STALE', 'MISSING', 'INCONSISTENT', 'ANOMALY'].map((type) => (
              <button
                key={type}
                onClick={() =>
                  setFilterAlerts((prev) =>
                    prev.includes(type as DataQualityAlert['type'])
                      ? prev.filter((t) => t !== type)
                      : [...prev, type as DataQualityAlert['type']]
                  )
                }
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterAlerts.includes(type as DataQualityAlert['type'])
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-50 border-red-400'
                    : alert.severity === 'WARNING'
                      ? 'bg-yellow-50 border-yellow-400'
                      : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-200 text-red-800'
                          : alert.severity === 'WARNING'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-blue-200 text-blue-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">
                      {alert.type}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      alert.status === 'ACTIVE'
                        ? 'bg-red-100 text-red-700'
                        : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>

                <p className="font-medium text-gray-800 mb-1">{alert.dimensionName}</p>
                <p className="text-sm text-gray-700 mb-2">{alert.message}</p>

                {alert.value !== undefined && alert.expectedRange && (
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div className="bg-white bg-opacity-50 p-2 rounded">
                      <p className="text-gray-600">Actual Value</p>
                      <p className="font-bold text-gray-800">{alert.value}</p>
                    </div>
                    <div className="bg-white bg-opacity-50 p-2 rounded">
                      <p className="text-gray-600">Expected Range</p>
                      <p className="font-bold text-gray-800">
                        {alert.expectedRange.min}-{alert.expectedRange.max}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-50 p-2 rounded">
                      <p className="text-gray-600">Last Updated</p>
                      <p className="font-bold text-gray-800">
                        {Math.round((Date.now() - alert.lastUpdated.getTime()) / 3600000)}h ago
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="text-xs bg-white bg-opacity-50 hover:bg-opacity-100 px-2 py-1 rounded transition">
                    Acknowledge
                  </button>
                  <button className="text-xs bg-white bg-opacity-50 hover:bg-opacity-100 px-2 py-1 rounded transition">
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dimension Health Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Dimension Health Summary</h2>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.dimensionHealth.map((dim) => (
            <div
              key={dim.dimensionId}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <button
                onClick={() =>
                  setExpandedDimension(
                    expandedDimension === dim.dimensionId ? null : dim.dimensionId
                  )
                }
                className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      dim.overallHealth >= 80
                        ? 'bg-green-500'
                        : dim.overallHealth >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-800">{dim.dimensionName}</p>
                    <p className="text-xs text-gray-600">
                      {dim.activeAlerts} active alerts · {dim.metricScores.length} metrics
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{dim.overallHealth}</p>
                    <p className="text-xs text-gray-600">/100</p>
                  </div>
                  <span className="text-gray-400">
                    {expandedDimension === dim.dimensionId ? '▼' : '▶'}
                  </span>
                </div>
              </button>

              {/* Expanded Metric Details */}
              {expandedDimension === dim.dimensionId && (
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="space-y-2">
                    {dim.metricScores.map((metric) => (
                      <div
                        key={metric.metricId}
                        className="p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-gray-800">{metric.metricName}</p>
                          <span
                            className={`font-bold px-2 py-1 rounded text-xs ${
                              metric.score >= 80
                                ? 'bg-green-100 text-green-800'
                                : metric.score >= 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {metric.score}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Completeness:</span>
                            <span className="font-bold text-gray-800">{metric.factors.completeness}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Recency:</span>
                            <span className="font-bold text-gray-800">{metric.factors.recency}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Consistency:</span>
                            <span className="font-bold text-gray-800">{metric.factors.consistency}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-green-800 mb-3">💡 Quality Recommendations</h2>
        <ul className="space-y-2 text-sm text-green-700">
          <li>
            • <strong>Update stale data:</strong> {data.statistics.staleCount} metrics haven't been
            updated in the past week. Schedule data collection for these.
          </li>
          <li>
            • <strong>Investigate outliers:</strong> {data.statistics.outlierCount} metrics show
            unusual values. Verify with data sources.
          </li>
          <li>
            • <strong>Improve consistency:</strong> Implement automated data validation rules to
            catch inconsistencies early.
          </li>
          <li>
            • <strong>Document sources:</strong> Ensure all metrics have clear data source
            documentation.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default QualityMonitoring;

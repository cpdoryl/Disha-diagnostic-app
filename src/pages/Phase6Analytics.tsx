/**
 * Phase 6: Analytics & Dashboards
 * Comprehensive real-time monitoring and analysis
 */

import React, { useState } from 'react';
import { DataAuditDashboard } from '../components/Phase5_DataInfrastructure/DataAuditDashboard';
import { ResponseRateTracker } from '../components/Phase5_DataInfrastructure/ResponseRateTracker';
import { TrendAnalysis } from '../components/Phase5_DataInfrastructure/TrendAnalysis';
import { QualityMonitoring } from '../components/Phase5_DataInfrastructure/QualityMonitoring';

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'audit' | 'responses' | 'trends' | 'quality';

// ============================================================================
// COMPONENT
// ============================================================================

export const Phase6Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('audit');

  // Get parameters from URL
  const searchParams = new URLSearchParams(window.location.search);
  const schoolId = searchParams.get('schoolId') || 'default-school';
  const cycleId = searchParams.get('cycleId') || 'cycle-2026-08';

  // ========================================================================
  // RENDER DASHBOARD
  // ========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Phase 6: Analytics & Dashboards</h1>
              <p className="text-gray-600 mt-2">
                Real-time monitoring of data collection, quality, and response progress
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">School</p>
              <p className="font-mono text-gray-800">{schoolId}</p>
              <p className="text-sm text-gray-600 mt-2">Cycle</p>
              <p className="font-mono text-gray-800">{cycleId}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'audit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Data Audit
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'responses'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 Survey Responses
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'trends'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📈 Trends
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'quality'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              ⚡ Quality Monitoring
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Data Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-semibold text-blue-800 mb-2">📊 Data Audit Dashboard</p>
              <p className="text-sm text-blue-700">
                Monitor metrics collection progress across all 14 dimensions. Track coverage,
                quality scores, and verification status in real-time.
              </p>
            </div>
            <DataAuditDashboard schoolId={schoolId} cycleId={cycleId} />
          </div>
        )}

        {/* Survey Responses Tab */}
        {activeTab === 'responses' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-800 mb-2">📋 Survey Response Tracking</p>
              <p className="text-sm text-green-700">
                Monitor perception survey completion rates by respondent type. Track daily trends
                and identify groups needing follow-up.
              </p>
            </div>
            <ResponseRateTracker schoolId={schoolId} cycleId={cycleId} />
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="font-semibold text-purple-800 mb-2">📈 Trend Analysis</p>
              <p className="text-sm text-purple-700">
                Year-over-year comparison of metrics and perception scores. Identify improving and
                declining dimensions.
              </p>
            </div>
            <TrendAnalysis schoolId={schoolId} cycleId={cycleId} previousCycleId="cycle-2026-07" />
          </div>
        )}

        {/* Quality Monitoring Tab */}
        {activeTab === 'quality' && (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="font-semibold text-orange-800 mb-2">⚡ Data Quality Monitoring</p>
              <p className="text-sm text-orange-700">
                Real-time quality alerts, outlier detection, and data freshness monitoring. Ensure
                data integrity throughout collection.
              </p>
            </div>
            <QualityMonitoring schoolId={schoolId} cycleId={cycleId} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="font-semibold text-gray-800 mb-2">📊 Phase 6 Status</p>
              <p className="text-sm text-gray-600">
                Week 3-5: Analytics dashboards, quality monitoring, trend analysis
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">✅ Completed</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Data Audit Dashboard</li>
                <li>• Response Rate Tracking</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">⏳ Coming Soon</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Trend Analysis Charts</li>
                <li>• Quality Monitoring</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">🚀 After Phase 6</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Integration Testing</li>
                <li>• Production Hardening</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase6Analytics;

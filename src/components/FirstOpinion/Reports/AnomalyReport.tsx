/**
 * First Opinion Engine v3 - Anomaly Report
 * Detailed report of flagged anomalies and suspicious patterns
 */

import React, { useState } from 'react'
import {
  identifyOutliers,
  detectConsistencyAnomalies,
  detectPatternAnomalies,
  type CycleMetrics,
  type AnomalyScore,
} from '../../../lib/firstOpinion/historicalAnalysis'

interface AnomalyReportProps {
  historicalCycles: CycleMetrics[]
  challengeSeverities?: number[]
}

const getAnomalyTypeColor = (type: string) => {
  switch (type) {
    case 'PATTERN':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'OUTLIER':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'CONSISTENCY':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'TREND':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getConfidenceBadge = (confidence: number) => {
  if (confidence >= 80) return '🟢 High'
  if (confidence >= 60) return '🟡 Medium'
  return '🔵 Low'
}

export const AnomalyReport: React.FC<AnomalyReportProps> = ({ historicalCycles, challengeSeverities = [] }) => {
  const [filter, setFilter] = useState<string | null>(null)

  // Collect all anomalies
  const allAnomalies: AnomalyScore[] = []

  // Outlier detection
  if (historicalCycles.length >= 3) {
    const outliers = identifyOutliers(historicalCycles)
    allAnomalies.push(...outliers)
  }

  // Consistency anomalies
  if (historicalCycles.length >= 2) {
    const consistency = detectConsistencyAnomalies(historicalCycles)
    allAnomalies.push(...consistency)
  }

  // Pattern anomalies
  if (challengeSeverities.length > 0) {
    const patterns = detectPatternAnomalies(challengeSeverities)
    allAnomalies.push(...patterns)
  }

  // Sort by score descending
  const sortedAnomalies = [...allAnomalies].sort((a, b) => b.score - a.score)
  const filteredAnomalies = filter ? sortedAnomalies.filter(a => a.type === filter) : sortedAnomalies

  // Stats
  const anomalyTypes = [...new Set(sortedAnomalies.map(a => a.type))]
  const highConfidenceCount = sortedAnomalies.filter(a => a.confidence >= 80).length
  const avgScore = sortedAnomalies.length > 0 ? sortedAnomalies.reduce((s, a) => s + a.score, 0) / sortedAnomalies.length : 0

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Anomaly Detection Report</h2>
        <p className="text-gray-600">Identified suspicious patterns and outliers in assessment data</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900 font-semibold mb-1">Total Anomalies</p>
          <p className="text-3xl font-bold text-blue-600">{sortedAnomalies.length}</p>
          <p className="text-xs text-blue-700 mt-1">Detected patterns</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <p className="text-xs text-red-900 font-semibold mb-1">High Confidence</p>
          <p className="text-3xl font-bold text-red-600">{highConfidenceCount}</p>
          <p className="text-xs text-red-700 mt-1">Confidence >= 80%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-900 font-semibold mb-1">Average Score</p>
          <p className="text-3xl font-bold text-purple-600">{avgScore.toFixed(1)}</p>
          <p className="text-xs text-purple-700 mt-1">Out of 100</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-900 font-semibold mb-1">Anomaly Types</p>
          <p className="text-3xl font-bold text-amber-600">{anomalyTypes.length}</p>
          <p className="text-xs text-amber-700 mt-1">Different categories</p>
        </div>
      </div>

      {/* Filters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Filter by Type</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All ({sortedAnomalies.length})
          </button>
          {anomalyTypes.map(type => {
            const count = sortedAnomalies.filter(a => a.type === type).length
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {type} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Anomalies List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detected Anomalies {filter && `- ${filter}`}
        </h3>

        {filteredAnomalies.length === 0 ? (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-800 font-semibold">✓ No anomalies detected</p>
            <p className="text-sm text-green-700 mt-1">Assessment data looks normal and consistent</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnomalies.map((anomaly, index) => (
              <div key={index} className={`border-2 rounded-lg p-4 ${getAnomalyTypeColor(anomaly.type)}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">Anomaly #{index + 1}</h4>
                    <p className="text-sm mt-1">{anomaly.details}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold opacity-20">{anomaly.score.toFixed(0)}</div>
                    <p className="text-xs opacity-75 mt-1">Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white bg-opacity-50 rounded p-2">
                    <p className="text-xs font-semibold opacity-75">Type</p>
                    <p className="text-sm font-medium">{anomaly.type}</p>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded p-2">
                    <p className="text-xs font-semibold opacity-75">Score</p>
                    <p className="text-sm font-medium">{anomaly.score.toFixed(1)}/100</p>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded p-2">
                    <p className="text-xs font-semibold opacity-75">Confidence</p>
                    <p className="text-sm font-medium">{getConfidenceBadge(anomaly.confidence)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anomaly Types Explanation */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Understanding Anomaly Types</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-purple-100 border-2 border-purple-300 rounded flex items-center justify-center font-bold text-purple-800">
              P
            </div>
            <div>
              <p className="font-semibold text-gray-900">PATTERN</p>
              <p className="text-sm text-gray-700">Suspicious response patterns (all max/min, low variance, bimodal distribution)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-12 h-12 bg-red-100 border-2 border-red-300 rounded flex items-center justify-center font-bold text-red-800">
              O
            </div>
            <div>
              <p className="font-semibold text-gray-900">OUTLIER</p>
              <p className="text-sm text-gray-700">Statistical outliers beyond 2 standard deviations from mean</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-12 h-12 bg-orange-100 border-2 border-orange-300 rounded flex items-center justify-center font-bold text-orange-800">
              C
            </div>
            <div>
              <p className="font-semibold text-gray-900">CONSISTENCY</p>
              <p className="text-sm text-gray-700">Inconsistent metrics (S_sub improving while M_obj declining, false recoveries)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-12 h-12 bg-blue-100 border-2 border-blue-300 rounded flex items-center justify-center font-bold text-blue-800">
              T
            </div>
            <div>
              <p className="font-semibold text-gray-900">TREND</p>
              <p className="text-sm text-gray-700">Unexpected trend reversals or pattern breaks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">Recommendations</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Review high-confidence anomalies (confidence >= 80%) first</li>
          <li>• Investigate outliers to determine if they represent data quality issues or genuine concerns</li>
          <li>• Follow up on consistency anomalies that suggest diverging trends</li>
          <li>• Pattern anomalies may indicate respondent disengagement — consider survey redesign or retake</li>
          <li>• Use anomaly insights to refine data collection and validation processes</li>
        </ul>
      </div>

      {/* Export Note */}
      <div className="text-xs text-gray-500 text-center">
        Report generated: {new Date().toLocaleString()} | Data-driven anomaly detection using statistical methods
      </div>
    </div>
  )
}

export default AnomalyReport

/**
 * DISHA Phase 4 - Analysis Dashboard
 * Comprehensive diagnostic report and analytics display
 */

import React, { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, doc, getDoc } from 'firebase/firestore'

interface AnalysisDashboardProps {
  schoolId: string
  cycleId: string
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ schoolId, cycleId }) => {
  const [report, setReport] = useState<any>(null)
  const [dimensions, setDimensions] = useState<any[]>([])
  const [trends, setTrends] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalysisData()
  }, [schoolId, cycleId])

  const loadAnalysisData = async () => {
    try {
      setLoading(true)
      const cycleRef = doc(
        db,
        'schools',
        schoolId,
        'assessmentCycles',
        cycleId,
        'reports',
        'latest'
      )
      const reportSnap = await getDoc(cycleRef)
      if (reportSnap.exists()) {
        setReport(reportSnap.data())
      }

      const dimensionsRef = doc(
        db,
        'schools',
        schoolId,
        'assessmentCycles',
        cycleId,
        'analysis',
        'dimensions'
      )
      const dimensionsSnap = await getDoc(dimensionsRef)
      if (dimensionsSnap.exists()) {
        setDimensions(dimensionsSnap.data().dimensions || [])
      }

      const trendsRef = doc(
        db,
        'schools',
        schoolId,
        'analysis',
        'trends'
      )
      const trendsSnap = await getDoc(trendsRef)
      if (trendsSnap.exists()) {
        setTrends(trendsSnap.data())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis')
      console.error('Error loading analysis:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading analysis...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>
  }

  if (!report) {
    return <div className="p-8 text-center">No analysis available</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold mb-2">Diagnostic Analysis Report</h1>
        <p className="text-gray-600">
          Comprehensive assessment for {schoolId} - Cycle {cycleId}
        </p>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Health Index" value={report.scores?.healthIndex?.toFixed(1)} unit="/" color="blue" />
        <Card title="S_sub (Perception)" value={report.scores?.s_sub?.toFixed(1)} unit="/" color="purple" />
        <Card title="M_obj (Reality)" value={report.scores?.m_obj?.toFixed(1)} unit="/" color="green" />
        <Card title="Gap Score" value={report.scores?.gap?.toFixed(1)} unit="/" color="orange" />
      </div>

      {/* Quadrant */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Assessment Quadrant</h2>
        <div className="text-lg font-semibold text-blue-900">{report.scores?.quadrant || 'ALIGNED'}</div>
        {report.scores?.quadrant === 'PERCEPTION_BETTER' && (
          <p className="text-sm text-blue-800 mt-2">⚠️ Blind spot detected: perception exceeds reality</p>
        )}
        {report.scores?.quadrant === 'REALITY_BETTER' && (
          <p className="text-sm text-blue-800 mt-2">✨ Communication opportunity: operations exceed perception</p>
        )}
        {report.scores?.quadrant === 'ALIGNED' && (
          <p className="text-sm text-blue-800 mt-2">✓ Perception aligns with operational reality</p>
        )}
      </div>

      {/* Respondents */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Respondent Summary</h2>
        <div className="space-y-2">
          <p className="text-lg">
            <span className="font-semibold">Total Respondents:</span> {report.respondentCount}
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {Object.entries(report.respondentsByRole || {}).map(([role, count]: [string, any]) => (
              <div key={role} className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">{role}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dimension Analysis */}
      {dimensions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">14-Dimension Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dimensions.map((dim, idx) => (
              <DimensionCard key={idx} dimension={dim} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
          <div className="space-y-4">
            {report.recommendations.map((rec, idx) => (
              <RecommendationCard key={idx} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      {trends && (
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Historical Trends</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">Assessment Cycles:</span> {trends.cycles}</p>
            <p><span className="font-semibold">Trajectory:</span> {trends.analysis?.trajectory}</p>
            <p><span className="font-semibold">Improvement Rate:</span> {trends.analysis?.improvementRate?.toFixed(2)} points/cycle</p>
            {trends.analysis?.forecast && (
              <p><span className="font-semibold">Next Forecast:</span> {trends.analysis.forecast.predictedHealthIndex?.toFixed(1)}</p>
            )}
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex gap-4">
        <button
          onClick={() => exportToPDF(report)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Export to PDF
        </button>
        <button
          onClick={() => exportToCSV(report, dimensions)}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Export to CSV
        </button>
      </div>
    </div>
  )
}

// Subcomponents
const Card = ({ title, value, unit, color }: any) => {
  const colorClass = {
    blue: 'bg-blue-50 text-blue-900',
    purple: 'bg-purple-50 text-purple-900',
    green: 'bg-green-50 text-green-900',
    orange: 'bg-orange-50 text-orange-900'
  }[color] || 'bg-gray-50'

  return (
    <div className={`${colorClass} p-4 rounded-lg`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-3xl font-bold mt-2">
        {value}
        <span className="text-lg opacity-75">{unit}</span>
      </p>
    </div>
  )
}

const DimensionCard = ({ dimension }: any) => {
  const statusColor = {
    EXCELLENT: 'text-green-600',
    GOOD: 'text-green-500',
    FAIR: 'text-yellow-600',
    POOR: 'text-orange-600',
    CRITICAL: 'text-red-600'
  }[dimension.status] || 'text-gray-600'

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <h3 className="font-bold text-lg mb-2">{dimension.dimensionName}</h3>
      <div className="space-y-2 text-sm">
        <p><span className="text-gray-600">Health Index:</span> {dimension.healthIndex?.toFixed(1)}</p>
        <p><span className="text-gray-600">Priority:</span> <span className="font-semibold">{dimension.priority}</span></p>
        <p><span className="text-gray-600">Status:</span> <span className={statusColor}>{dimension.status}</span></p>
        <p className="text-gray-700 mt-3">{dimension.insight}</p>
      </div>
    </div>
  )
}

const RecommendationCard = ({ recommendation }: any) => {
  const categoryColor = {
    CRITICAL: 'bg-red-100 border-red-300',
    HIGH: 'bg-orange-100 border-orange-300',
    MEDIUM: 'bg-yellow-100 border-yellow-300',
    LOW: 'bg-green-100 border-green-300',
    PROCESS: 'bg-blue-100 border-blue-300',
    RISK: 'bg-red-100 border-red-300',
    OPPORTUNITY: 'bg-green-100 border-green-300'
  }[recommendation.category] || 'bg-gray-100 border-gray-300'

  return (
    <div className={`border ${categoryColor} p-4 rounded-lg`}>
      <h3 className="font-bold text-lg mb-2">{recommendation.title}</h3>
      <p className="text-sm mb-3">{recommendation.description}</p>
      {recommendation.actions && (
        <ul className="text-sm space-y-1 ml-4 list-disc">
          {recommendation.actions.map((action: string, idx: number) => (
            <li key={idx}>{action}</li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-600 mt-3">Timeline: {recommendation.timeline}</p>
    </div>
  )
}

// Export functions
const exportToPDF = (report: any) => {
  console.log('Exporting to PDF...')
  // Will be implemented with PDF library
}

const exportToCSV = (report: any, dimensions: any[]) => {
  console.log('Exporting to CSV...')
  // Will be implemented with CSV library
}

export default AnalysisDashboard

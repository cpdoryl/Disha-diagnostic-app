/**
 * First Opinion Engine v3 - Results Dashboard
 * Real-time visualization of S_sub, M_obj, Health Index, and Gap scores
 */

import React, { useState, useEffect } from 'react'
import { db } from '../../../lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import {
  ComposedChart,
  AreaChart,
  BarChart,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  Area,
  Line,
} from 'recharts'

interface DashboardMetrics {
  s_sub: number
  m_obj: number
  healthIndex: number
  gap: number
  quadrant: string
  interpretation?: string
  delusionPenalty?: number
  respondentCount?: number
  lastCalculatedAt?: Date
}

interface FirstOpinionResultsDashboardProps {
  schoolId: string
  cycleId: string
}

const getQuadrantColor = (quadrant: string) => {
  switch (quadrant) {
    case 'REALITY_BETTER':
      return 'text-green-600'
    case 'ALIGNED':
      return 'text-blue-600'
    case 'PERCEPTION_BETTER':
      return 'text-orange-600'
    default:
      return 'text-gray-600'
  }
}

const getHealthStatus = (healthIndex: number) => {
  if (healthIndex >= 75) return { label: 'Excellent', color: 'bg-green-100 text-green-800' }
  if (healthIndex >= 60) return { label: 'Good', color: 'bg-blue-100 text-blue-800' }
  if (healthIndex >= 45) return { label: 'Adequate', color: 'bg-yellow-100 text-yellow-800' }
  return { label: 'Needs Attention', color: 'bg-red-100 text-red-800' }
}

export const FirstOpinionResultsDashboard: React.FC<FirstOpinionResultsDashboardProps> = ({
  schoolId,
  cycleId,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const cycleRef = doc(db, 'schools', schoolId, 'assessmentCycles', cycleId)

    const unsubscribe = onSnapshot(
      cycleRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setMetrics({
            s_sub: data.scores?.s_sub || 0,
            m_obj: data.scores?.m_obj || 0,
            healthIndex: data.scores?.healthIndex || 0,
            gap: data.scores?.gap || 0,
            quadrant: data.scores?.quadrant || 'UNKNOWN',
            interpretation: data.scores?.interpretation,
            delusionPenalty: data.scores?.delusionPenalty,
            respondentCount: data.respondentCount,
            lastCalculatedAt: data.scores?.lastCalculatedAt?.toDate?.(),
          })
          setError(null)
        } else {
          setError('Assessment cycle not found')
        }
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching metrics:', err)
        setError('Failed to load assessment data')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [schoolId, cycleId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading assessment results...</p>
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
        <p className="text-red-700">{error || 'No data available'}</p>
      </div>
    )
  }

  const healthStatus = getHealthStatus(metrics.healthIndex)
  const chartData = [
    {
      name: 'Score',
      s_sub: metrics.s_sub,
      m_obj: metrics.m_obj,
      healthIndex: metrics.healthIndex,
      gap: metrics.gap,
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">First Opinion Assessment Results</h2>
        <p className="text-gray-600">Real-time diagnostic analysis of school health</p>
        {metrics.lastCalculatedAt && (
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {metrics.lastCalculatedAt.toLocaleString()}
          </p>
        )}
      </div>

      {/* Core Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* S_sub */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-2">SUBJECTIVE SCORE (S_sub)</p>
          <p className="text-4xl font-bold text-blue-600">{metrics.s_sub.toFixed(1)}</p>
          <p className="text-xs text-blue-800 mt-2">Leadership perception</p>
          {metrics.delusionPenalty !== undefined && metrics.delusionPenalty > 0 && (
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Overconfidence penalty: -{metrics.delusionPenalty.toFixed(1)}
            </p>
          )}
        </div>

        {/* M_obj */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <p className="text-sm font-semibold text-green-900 mb-2">OBJECTIVE SCORE (M_obj)</p>
          <p className="text-4xl font-bold text-green-600">{metrics.m_obj.toFixed(1)}</p>
          <p className="text-xs text-green-800 mt-2">Operational reality</p>
        </div>

        {/* Health Index */}
        <div className={`bg-gradient-to-br p-6 rounded-lg border ${
          healthStatus.color === 'bg-green-100 text-green-800'
            ? 'from-green-50 to-green-100 border-green-200'
            : healthStatus.color === 'bg-blue-100 text-blue-800'
              ? 'from-blue-50 to-blue-100 border-blue-200'
              : healthStatus.color === 'bg-yellow-100 text-yellow-800'
                ? 'from-yellow-50 to-yellow-100 border-yellow-200'
                : 'from-red-50 to-red-100 border-red-200'
        }`}>
          <p className="text-sm font-semibold mb-2">HEALTH INDEX</p>
          <p className="text-4xl font-bold">{metrics.healthIndex.toFixed(1)}</p>
          <p className={`text-sm font-semibold mt-2 ${healthStatus.color}`}>
            {healthStatus.label}
          </p>
        </div>

        {/* Gap */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <p className="text-sm font-semibold text-purple-900 mb-2">PERCEPTION-REALITY GAP</p>
          <p className="text-4xl font-bold text-purple-600">{metrics.gap.toFixed(1)}</p>
          <p className={`text-xs font-semibold mt-2 ${getQuadrantColor(metrics.quadrant)}`}>
            {metrics.quadrant === 'REALITY_BETTER'
              ? '✓ Reality exceeds perception'
              : metrics.quadrant === 'ALIGNED'
                ? '≈ Perceptions aligned'
                : '⚠ Perception exceeds reality'}
          </p>
        </div>
      </div>

      {/* Respondent Count */}
      {metrics.respondentCount !== undefined && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{metrics.respondentCount}</span> respondent
            {metrics.respondentCount !== 1 ? 's' : ''} have submitted their assessments
          </p>
        </div>
      )}

      {/* Score Comparison Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              formatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Legend />
            <Bar dataKey="s_sub" fill="#3b82f6" name="Subjective (S_sub)" />
            <Bar dataKey="m_obj" fill="#10b981" name="Objective (M_obj)" />
            <Bar dataKey="healthIndex" fill="#f59e0b" name="Health Index" />
            <Bar dataKey="gap" fill="#8b5cf6" name="Perception-Reality Gap" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      {metrics.interpretation && (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2">Diagnostic Interpretation</h3>
          <p className="text-sm text-indigo-800">{metrics.interpretation}</p>
        </div>
      )}

      {/* Action Items */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <p className="font-semibold text-blue-900 mb-2">📊 Review Detailed Analysis</p>
            <p className="text-sm text-blue-800">Explore dimension-wise breakdown and challenge drivers</p>
          </div>
          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <p className="font-semibold text-green-900 mb-2">📈 View Recommendations</p>
            <p className="text-sm text-green-800">Get AI-powered improvement recommendations</p>
          </div>
          <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
            <p className="font-semibold text-purple-900 mb-2">📉 Historical Trends</p>
            <p className="text-sm text-purple-800">Compare with previous cycles and track progress</p>
          </div>
          <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
            <p className="font-semibold text-orange-900 mb-2">📄 Generate Report</p>
            <p className="text-sm text-orange-800">Export comprehensive diagnostic report as PDF</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FirstOpinionResultsDashboard

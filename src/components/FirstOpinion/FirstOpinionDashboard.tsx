/**
 * DISHA First Opinion Engine - Dashboard
 * Executive-level diagnostic visualization
 */

import React, { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

interface FirstOpinionReportData {
  schoolId: string
  cycleId: string
  scores: {
    s_sub: number
    m_obj: number
    healthIndex: number
    gap: number
    quadrant: string
    delusionPenalty: number
  }
  respondentCount: number
  respondentsByRole: Record<string, number>
  challengesAnswered: number
  totalChallenges: number
  completionRate: number
  drivers: Array<any>
  multipliers: Array<any>
  interpretation: any
  recommendations: Array<any>
}

interface FirstOpinionDashboardProps {
  schoolId: string
  cycleId: string
}

export const FirstOpinionDashboard: React.FC<FirstOpinionDashboardProps> = ({ schoolId, cycleId }) => {
  const [report, setReport] = useState<FirstOpinionReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReport()
  }, [schoolId, cycleId])

  const loadReport = async () => {
    try {
      setLoading(true)
      const reportRef = doc(
        db,
        'schools',
        schoolId,
        'assessmentCycles',
        cycleId,
        'firstOpinionReports',
        'latest'
      )
      const reportSnap = await getDoc(reportRef)

      if (reportSnap.exists()) {
        setReport(reportSnap.data() as FirstOpinionReportData)
      } else {
        setError('First Opinion Report not found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report')
      console.error('Error loading report:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading First Opinion Report...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>
  }

  if (!report) {
    return <div className="p-8 text-center">No report available</div>
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      EXCELLENT: 'bg-green-100 text-green-900 border-green-300',
      GOOD: 'bg-blue-100 text-blue-900 border-blue-300',
      FAIR: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      POOR: 'bg-orange-100 text-orange-900 border-orange-300',
      CRITICAL: 'bg-red-100 text-red-900 border-red-300'
    }
    return colors[status] || 'bg-gray-100'
  }

  const getQuadrantColor = (quadrant: string) => {
    const colors: Record<string, string> = {
      ALIGNED: 'bg-green-100 border-green-300',
      REALITY_BETTER: 'bg-blue-100 border-blue-300',
      PERCEPTION_BETTER: 'bg-orange-100 border-orange-300'
    }
    return colors[quadrant] || 'bg-gray-100'
  }

  const topDriver = report.drivers[0]

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold mb-2">First Opinion Report</h1>
        <p className="text-gray-600">{schoolId} - Cycle {cycleId}</p>
      </div>

      {/* Health Index Gauge */}
      <div className={`${getStatusColor(report.interpretation.healthStatus)} p-8 rounded-lg border-2`}>
        <div className="text-center">
          <p className="text-sm font-semibold mb-2">HEALTH INDEX</p>
          <p className="text-6xl font-bold mb-4">{report.scores.healthIndex}</p>
          <p className="text-2xl font-semibold">{report.interpretation.healthStatus}</p>
          <p className="text-sm mt-4">{report.interpretation.healthDescription}</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Perception (S_sub)" value={report.scores.s_sub} max={100} />
        <MetricCard label="Reality (M_obj)" value={report.scores.m_obj} max={100} />
        <MetricCard label="Gap" value={report.scores.gap} max={100} />
        <MetricCard label="Completion" value={report.completionRate} max={100} suffix="%" />
      </div>

      {/* Quadrant Analysis */}
      <div className={`${getQuadrantColor(report.scores.quadrant)} p-6 rounded-lg border-2`}>
        <h2 className="text-2xl font-bold mb-2">Perception vs Reality</h2>
        <p className="font-semibold text-lg mb-2">{report.scores.quadrant}</p>
        <p className="text-sm">{report.interpretation.quadrantInsight}</p>

        {report.interpretation.blindSpotRisk && (
          <div className="mt-4 p-3 bg-red-200 border border-red-400 rounded">
            <p className="font-semibold text-red-900">⚠️ BLIND SPOT RISK DETECTED</p>
            <p className="text-sm text-red-800">Leadership perceives better performance than operations show</p>
          </div>
        )}

        {report.interpretation.communicationGap && (
          <div className="mt-4 p-3 bg-blue-200 border border-blue-400 rounded">
            <p className="font-semibold text-blue-900">💡 COMMUNICATION OPPORTUNITY</p>
            <p className="text-sm text-blue-800">Operations are strong but achievements are not well communicated</p>
          </div>
        )}
      </div>

      {/* Challenge Drivers */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Challenge Drivers (Priority Ranking)</h2>
        {topDriver && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <p className="text-sm font-semibold text-red-900">TOP DRIVER</p>
            <p className="text-lg font-bold">{topDriver.challengeTitle}</p>
            <p className="text-sm text-gray-700">Domain: {topDriver.domain}</p>
            <p className="text-sm mt-2">Severity: <span className="font-bold">{topDriver.severity}%</span></p>
            <p className="text-xs text-red-700 mt-2">
              This challenge accounts for {(topDriver.contribution * 100).toFixed(1)}% of overall concern
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.drivers.slice(1).map((driver, idx) => (
            <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition">
              <p className="font-semibold">{driver.challengeTitle}</p>
              <p className="text-sm text-gray-600">{driver.domain}</p>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Severity</span>
                  <span className="font-semibold">{driver.severity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${driver.severity}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multiplier Profile */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Operational Multipliers (8 Metrics)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.multipliers.map((mult, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{mult.name}</p>
                  <p className="text-xs text-gray-600">{mult.category}</p>
                </div>
                <span className={`text-sm font-bold px-2 py-1 rounded ${
                  mult.status === 'VALID' ? 'bg-green-200 text-green-900' :
                  mult.status === 'OUTLIER' ? 'bg-yellow-200 text-yellow-900' :
                  'bg-red-200 text-red-900'
                }`}>
                  {mult.status}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Value</span>
                  <span className="font-semibold">{mult.value.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${mult.value}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Respondent Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Response Summary</h2>
        <div className="space-y-2 mb-4">
          <p><span className="font-semibold">Respondents:</span> {report.respondentCount} people</p>
          <p><span className="font-semibold">Challenges:</span> {report.challengesAnswered} of {report.totalChallenges}</p>
          <p><span className="font-semibold">Completion:</span> {report.completionRate.toFixed(1)}%</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(report.respondentsByRole).map(([role, count]) => (
            <div key={role} className="bg-white p-3 rounded border text-center">
              <p className="text-sm text-gray-600">{role}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
          <div className="space-y-4">
            {report.recommendations.map((rec, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                rec.severity === 'CRITICAL' ? 'bg-red-50 border-red-400' :
                rec.severity === 'HIGH' ? 'bg-orange-50 border-orange-400' :
                rec.severity === 'MEDIUM' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{rec.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    rec.severity === 'CRITICAL' ? 'bg-red-200 text-red-900' :
                    rec.severity === 'HIGH' ? 'bg-orange-200 text-orange-900' :
                    rec.severity === 'MEDIUM' ? 'bg-yellow-200 text-yellow-900' :
                    'bg-blue-200 text-blue-900'
                  }`}>
                    {rec.severity}
                  </span>
                </div>
                <p className="text-sm mb-3">{rec.description}</p>
                {rec.actions && rec.actions.length > 0 && (
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    {rec.actions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: number
  max: number
  suffix?: string
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, max, suffix = '' }) => {
  const percent = (value / max) * 100
  const getColor = () => {
    if (percent >= 80) return 'text-green-600'
    if (percent >= 60) return 'text-blue-600'
    if (percent >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white p-4 rounded-lg border">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${getColor()}`}>
        {value.toFixed(1)}{suffix}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
        <div
          className={`h-2 rounded-full ${
            percent >= 80 ? 'bg-green-500' :
            percent >= 60 ? 'bg-blue-500' :
            percent >= 40 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default FirstOpinionDashboard

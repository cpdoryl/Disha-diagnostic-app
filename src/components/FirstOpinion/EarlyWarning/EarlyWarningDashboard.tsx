/**
 * First Opinion Engine v3 - Early Warning Dashboard
 * Real-time visualization of early warnings, risk factors, and recommended actions
 */

import React, { useState, useEffect } from 'react'
import { db } from '../../../lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { generateEarlyWarning, type EarlyWarning } from '../../../lib/firstOpinion/earlyWarningRules'

interface EarlyWarningDashboardProps {
  schoolId: string
  cycleId: string
  healthIndex: number
  gap: number
  s_sub: number
  m_obj: number
  respondentCount: number
  quadrant: string
}

const getWarningColor = (level: string) => {
  switch (level) {
    case 'GREEN':
      return 'bg-green-50 border-green-300 text-green-900'
    case 'YELLOW':
      return 'bg-yellow-50 border-yellow-300 text-yellow-900'
    case 'RED':
      return 'bg-red-50 border-red-300 text-red-900'
    case 'CRITICAL':
      return 'bg-red-100 border-red-500 text-red-900'
    default:
      return 'bg-gray-50 border-gray-300 text-gray-900'
  }
}

const getWarningIcon = (level: string) => {
  switch (level) {
    case 'GREEN':
      return '🟢'
    case 'YELLOW':
      return '🟡'
    case 'RED':
      return '🔴'
    case 'CRITICAL':
      return '🔴'
    default:
      return '⚪'
  }
}

const getSeverityColor = (severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
  switch (severity) {
    case 'LOW':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export const EarlyWarningDashboard: React.FC<EarlyWarningDashboardProps> = ({
  schoolId,
  cycleId,
  healthIndex,
  gap,
  s_sub,
  m_obj,
  respondentCount,
  quadrant,
}) => {
  const [warning, setWarning] = useState<EarlyWarning | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Generate warning based on current metrics
    const generatedWarning = generateEarlyWarning(healthIndex, gap, s_sub, m_obj, respondentCount, quadrant)
    setWarning(generatedWarning)
    setLoading(false)
  }, [healthIndex, gap, s_sub, m_obj, respondentCount, quadrant])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing early warnings...</p>
        </div>
      </div>
    )
  }

  if (!warning) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-700">Unable to generate warning</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Early Warning Dashboard</h2>
        <p className="text-gray-600">Real-time risk assessment and recommended actions</p>
      </div>

      {/* Warning Status Card */}
      <div className={`border-2 rounded-lg p-8 ${getWarningColor(warning.level)}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{getWarningIcon(warning.level)}</span>
              <div>
                <h3 className="text-2xl font-bold">{warning.level} ALERT</h3>
                <p className="text-sm opacity-75">Risk Score: {warning.score.toFixed(0)}/100</p>
              </div>
            </div>
            <p className="text-lg leading-relaxed">{warning.interpretation}</p>
          </div>
          <div className="text-right ml-6">
            <div className="text-5xl font-bold opacity-20">{warning.score.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
        <div className="space-y-3">
          {warning.factors.length === 0 ? (
            <p className="text-gray-600 italic">No risk factors identified. School is performing well.</p>
          ) : (
            warning.factors.map((factor, index) => (
              <div key={index} className={`border-l-4 p-4 rounded ${getSeverityColor(factor.severity)}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{factor.name}</h4>
                  <span className="text-xs font-bold uppercase">{factor.severity}</span>
                </div>
                <p className="text-sm mb-2">{factor.description}</p>
                <p className="text-xs opacity-75">
                  Current: {factor.value.toFixed(1)} | Threshold: {factor.threshold.toFixed(1)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommended Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
        {warning.actions.length === 0 ? (
          <p className="text-gray-600 italic">No actions required at this time.</p>
        ) : (
          <div className="space-y-4">
            {warning.actions.map((action, index) => {
              const priorityColors = {
                1: 'bg-red-50 border-red-300 text-red-900',
                2: 'bg-yellow-50 border-yellow-300 text-yellow-900',
                3: 'bg-blue-50 border-blue-300 text-blue-900',
              }
              return (
                <div key={index} className={`border-2 rounded-lg p-4 ${priorityColors[action.priority]}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg">{action.title}</h4>
                    <span className="text-xs font-bold bg-white bg-opacity-50 px-2 py-1 rounded">
                      P{action.priority}
                    </span>
                  </div>
                  <p className="text-sm mb-3">{action.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-semibold">Timeline:</span>
                      <p>{action.timeline}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Owner:</span>
                      <p>{action.owner || 'TBD'}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Key Metrics Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600 font-semibold mb-1">Health Index</p>
            <p className="text-2xl font-bold text-gray-900">{healthIndex.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">Current level</p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600 font-semibold mb-1">Gap</p>
            <p className="text-2xl font-bold text-gray-900">{gap.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">Perception vs Reality</p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600 font-semibold mb-1">S_sub</p>
            <p className="text-2xl font-bold text-gray-900">{s_sub.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">Leadership perception</p>
          </div>
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600 font-semibold mb-1">M_obj</p>
            <p className="text-2xl font-bold text-gray-900">{m_obj.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">Operational reality</p>
          </div>
        </div>
      </div>

      {/* Alert Guidelines */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">Understanding Alert Levels</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <span className="font-bold">🟢 GREEN:</span> School performing well, continue current trajectory
          </p>
          <p>
            <span className="font-bold">🟡 YELLOW:</span> Minor concerns, monitor trends closely and take targeted actions
          </p>
          <p>
            <span className="font-bold">🔴 RED:</span> Significant issues requiring structured improvement initiatives
          </p>
          <p>
            <span className="font-bold">🔴 CRITICAL:</span> Emergency situation demanding immediate intervention
          </p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-right">
        Last updated: {warning.lastUpdated.toLocaleString()}
      </div>
    </div>
  )
}

export default EarlyWarningDashboard

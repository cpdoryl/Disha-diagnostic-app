/**
 * First Opinion Engine v3 - Alert Notifications
 * Toast-style alerts for warning level changes and critical alerts
 */

import React, { useState, useCallback } from 'react'
import { type EarlyWarning } from '../../../lib/firstOpinion/earlyWarningRules'

interface AlertNotificationProps {
  warning: EarlyWarning | null
  isVisible: boolean
  onDismiss: () => void
  onViewDetails?: () => void
}

const getAlertIcon = (level: string) => {
  switch (level) {
    case 'GREEN':
      return '✓'
    case 'YELLOW':
      return '!'
    case 'RED':
      return '⚠'
    case 'CRITICAL':
      return '✕'
    default:
      return 'i'
  }
}

const getAlertColors = (level: string) => {
  switch (level) {
    case 'GREEN':
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-800',
        icon: 'bg-green-500',
        button: 'hover:bg-green-100',
      }
    case 'YELLOW':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-800',
        icon: 'bg-yellow-500',
        button: 'hover:bg-yellow-100',
      }
    case 'RED':
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-800',
        icon: 'bg-red-500',
        button: 'hover:bg-red-100',
      }
    case 'CRITICAL':
      return {
        bg: 'bg-red-100',
        border: 'border-red-500',
        text: 'text-red-900',
        icon: 'bg-red-600',
        button: 'hover:bg-red-200',
      }
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-300',
        text: 'text-gray-800',
        icon: 'bg-gray-500',
        button: 'hover:bg-gray-100',
      }
  }
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({ warning, isVisible, onDismiss, onViewDetails }) => {
  const [showDetails, setShowDetails] = useState(false)

  if (!warning || !isVisible) return null

  const colors = getAlertColors(warning.level)
  const isPriority = warning.level === 'RED' || warning.level === 'CRITICAL'

  return (
    <div
      className={`fixed top-4 right-4 max-w-md shadow-lg rounded-lg border-2 transition-all duration-300 ${colors.bg} ${colors.border} z-50`}
    >
      {/* Header */}
      <div className={`flex items-start gap-3 p-4 ${colors.text}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.icon} text-white flex items-center justify-center font-bold text-lg`}>
          {getAlertIcon(warning.level)}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{warning.level} ALERT</h3>
          <p className="text-sm opacity-75">Risk Score: {warning.score.toFixed(0)}/100</p>
        </div>
        <button
          onClick={onDismiss}
          className={`text-2xl opacity-50 hover:opacity-100 transition-opacity ${colors.text}`}
        >
          ✕
        </button>
      </div>

      {/* Message */}
      <div className={`px-4 pb-4 ${colors.text} text-sm leading-relaxed`}>{warning.interpretation}</div>

      {/* Action Buttons */}
      <div className={`border-t-2 ${colors.border} px-4 py-3 flex gap-2`}>
        {isPriority && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`flex-1 px-3 py-2 bg-white rounded font-semibold text-sm transition-colors ${colors.text} ${colors.button}`}
          >
            {showDetails ? 'Hide' : 'View'} Details
          </button>
        )}
        <button
          onClick={onViewDetails}
          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded font-semibold text-sm hover:bg-blue-600 transition-colors"
        >
          Go to Dashboard
        </button>
        <button
          onClick={onDismiss}
          className={`px-3 py-2 bg-white rounded font-semibold text-sm transition-colors ${colors.text} ${colors.button}`}
        >
          Dismiss
        </button>
      </div>

      {/* Details Section */}
      {showDetails && warning.factors.length > 0 && (
        <div className={`border-t-2 ${colors.border} px-4 py-4 bg-white bg-opacity-30`}>
          <h4 className={`font-semibold text-sm ${colors.text} mb-3`}>Risk Factors:</h4>
          <div className="space-y-2">
            {warning.factors.slice(0, 3).map((factor, index) => (
              <div key={index} className="text-xs">
                <p className="font-semibold">• {factor.name}</p>
                <p className="opacity-75">{factor.description}</p>
              </div>
            ))}
            {warning.factors.length > 3 && (
              <p className="text-xs opacity-50 italic">+{warning.factors.length - 3} more factors...</p>
            )}
          </div>
        </div>
      )}

      {/* Animation for critical alerts */}
      {isPriority && (
        <style>{`
          @keyframes pulse-border {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .critical-pulse {
            animation: pulse-border 1s ease-in-out infinite;
          }
        `}</style>
      )}
    </div>
  )
}

/**
 * Alert History Component - Shows past alerts
 */
interface AlertHistoryEntry {
  id: string
  level: string
  timestamp: Date
  message: string
  dismissed: boolean
}

interface AlertHistoryProps {
  alerts: AlertHistoryEntry[]
  onClear: () => void
}

export const AlertHistory: React.FC<AlertHistoryProps> = ({ alerts, onClear }) => {
  const activeAlerts = alerts.filter(a => !a.dismissed)
  const dismissedAlerts = alerts.filter(a => a.dismissed)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Alert History</h2>
        {dismissedAlerts.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
          >
            Clear Dismissed
          </button>
        )}
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Alerts</h3>
          <div className="space-y-2">
            {activeAlerts.map(alert => {
              const colors = getAlertColors(alert.level)
              return (
                <div
                  key={alert.id}
                  className={`border-l-4 p-3 rounded ${colors.bg} ${colors.border} ${colors.text}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{alert.level} Alert</p>
                      <p className="text-sm mt-1">{alert.message}</p>
                    </div>
                    <p className="text-xs opacity-75 ml-4 flex-shrink-0">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Dismissed Alerts */}
      {dismissedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Dismissed Alerts ({dismissedAlerts.length})</h3>
          <div className="space-y-2 opacity-60">
            {dismissedAlerts.map(alert => (
              <div key={alert.id} className="border-l-4 border-gray-300 p-3 rounded bg-gray-50">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-700">{alert.message}</p>
                  <p className="text-xs text-gray-500 ml-4 flex-shrink-0">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Alerts */}
      {alerts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 italic">No alerts generated yet</p>
        </div>
      )}
    </div>
  )
}

/**
 * Alert Configuration Panel - User preferences for alerts
 */
interface AlertConfigProps {
  onConfigChange: (config: AlertConfig) => void
}

export interface AlertConfig {
  enableEmail: boolean
  enableNotifications: boolean
  enableSoundAlert: boolean
  criticalOnly: boolean
}

export const AlertConfiguration: React.FC<AlertConfigProps> = ({ onConfigChange }) => {
  const [config, setConfig] = React.useState<AlertConfig>({
    enableEmail: true,
    enableNotifications: true,
    enableSoundAlert: false,
    criticalOnly: false,
  })

  const handleChange = (key: keyof AlertConfig) => {
    const newConfig = { ...config, [key]: !config[key] }
    setConfig(newConfig)
    onConfigChange(newConfig)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Alert Settings</h2>
        <p className="text-gray-600 text-sm">Configure how and when you receive alerts</p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableNotifications}
            onChange={() => handleChange('enableNotifications')}
            className="w-4 h-4 rounded border-gray-300"
          />
          <div>
            <p className="font-semibold text-gray-900">In-App Notifications</p>
            <p className="text-sm text-gray-600">Show popup alerts in the dashboard</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableEmail}
            onChange={() => handleChange('enableEmail')}
            className="w-4 h-4 rounded border-gray-300"
          />
          <div>
            <p className="font-semibold text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-600">Send email alerts for important changes</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableSoundAlert}
            onChange={() => handleChange('enableSoundAlert')}
            className="w-4 h-4 rounded border-gray-300"
          />
          <div>
            <p className="font-semibold text-gray-900">Sound Alerts</p>
            <p className="text-sm text-gray-600">Play sound notification for critical alerts</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.criticalOnly}
            onChange={() => handleChange('criticalOnly')}
            className="w-4 h-4 rounded border-gray-300"
          />
          <div>
            <p className="font-semibold text-gray-900">Critical Alerts Only</p>
            <p className="text-sm text-gray-600">Only receive alerts for CRITICAL and RED warnings</p>
          </div>
        </label>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <span className="font-semibold">Tip:</span> Enable multiple alert channels to ensure you don't miss important warnings
        </p>
      </div>
    </div>
  )
}

export default AlertNotification

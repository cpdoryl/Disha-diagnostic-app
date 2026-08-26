/**
 * First Opinion Engine v3 - Admin Multiplier Sync
 * Interface for admins to sync multiplier values and trigger recalculation
 */

import React, { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../../lib/firebase'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const multiplierSchema = z.object({
  schoolId: z.string().min(1, 'School ID required'),
  cycleId: z.string().min(1, 'Cycle ID required'),
  multipliers: z.array(
    z.object({
      id: z.enum(['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8']),
      name: z.string().min(1),
      value: z.number().min(0).max(1.5),
      category: z.enum(['CORE', 'EXPANDED']),
    })
  ),
})

type MultiplierFormData = z.infer<typeof multiplierSchema>

const MULTIPLIERS = [
  { id: 'M1', name: 'STR (Student-to-Resource)', category: 'CORE', description: 'Ratio of students to available resources' },
  { id: 'M2', name: 'Parent SLA', category: 'CORE', description: 'Service level agreement compliance for parent communication' },
  { id: 'M3', name: 'Teacher Training', category: 'CORE', description: 'Percentage of teachers with current professional development' },
  { id: 'M4', name: 'Weekly Planning', category: 'CORE', description: 'Adherence to curriculum and lesson planning' },
  { id: 'M5', name: 'Fee Realization', category: 'EXPANDED', description: 'Percentage of fees collected' },
  { id: 'M6', name: 'Safety & Compliance', category: 'EXPANDED', description: 'Adherence to safety protocols' },
  { id: 'M7', name: 'Digital/LMS Usage', category: 'EXPANDED', description: 'Learning management system adoption' },
  { id: 'M8', name: 'Extracurricular', category: 'EXPANDED', description: 'Student participation in co-curricular activities' },
]

interface MultiplierSyncProps {
  schoolId: string
  cycleId: string
  onSyncComplete?: () => void
}

interface SyncResult {
  success: boolean
  syncedCount: number
  invalidCount: number
  results?: Array<{
    id: string
    status: string
    error?: string
  }>
  error?: string
}

export const MultiplierSync: React.FC<MultiplierSyncProps> = ({
  schoolId,
  cycleId,
  onSyncComplete,
}) => {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [expandedMultiplier, setExpandedMultiplier] = useState<string | null>(null)

  const { control, handleSubmit, formState: { errors }, watch } = useForm<MultiplierFormData>({
    resolver: zodResolver(multiplierSchema),
    defaultValues: {
      schoolId,
      cycleId,
      multipliers: MULTIPLIERS.map((m) => ({
        id: m.id as any,
        name: m.name,
        value: 0.9, // Default value
        category: m.category as any,
      })),
    },
  })

  const multipliers = watch('multipliers')

  const onSubmit = async (data: MultiplierFormData) => {
    setSyncing(true)
    try {
      const syncMultipliers = httpsCallable(functions, 'syncMultipliers')
      const result = await syncMultipliers({
        schoolId: data.schoolId,
        cycleId: data.cycleId,
        multipliers: data.multipliers,
      })

      setSyncResult(result.data as SyncResult)
      onSyncComplete?.()
    } catch (error) {
      console.error('Error syncing multipliers:', error)
      setSyncResult({
        success: false,
        syncedCount: 0,
        invalidCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Multiplier Configuration</h2>
        <p className="text-gray-600">Manage objective multiplier values for assessment cycle</p>
        <p className="text-xs text-gray-500 mt-2">
          School: <span className="font-mono text-gray-600">{schoolId}</span> | Cycle: <span className="font-mono text-gray-600">{cycleId}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Core Multipliers */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-600 rounded-full" />
            Core Multipliers (M1-M4)
          </h3>
          <div className="space-y-3">
            {MULTIPLIERS.filter((m) => m.category === 'CORE').map((mult, index) => (
              <div key={mult.id} className="border border-gray-200 rounded-lg p-4">
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => setExpandedMultiplier(expandedMultiplier === mult.id ? null : mult.id)}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{mult.name}</h4>
                    <p className="text-sm text-gray-600">{mult.description}</p>
                  </div>
                  <span className="text-gray-400">
                    {expandedMultiplier === mult.id ? '▼' : '▶'}
                  </span>
                </div>

                {expandedMultiplier === mult.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value (0.0 - 1.5)
                      </label>
                      <Controller
                        name={`multipliers.${MULTIPLIERS.findIndex((m) => m.id === mult.id)}.value`}
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="0"
                              max="1.5"
                              step="0.05"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="w-20">
                              <input
                                type="number"
                                min="0"
                                max="1.5"
                                step="0.01"
                                value={field.value}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-right"
                              />
                            </div>
                          </div>
                        )}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Higher values = stronger operational capability
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Expanded Multipliers */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-600 rounded-full" />
            Expanded Multipliers (M5-M8)
          </h3>
          <div className="space-y-3">
            {MULTIPLIERS.filter((m) => m.category === 'EXPANDED').map((mult) => (
              <div key={mult.id} className="border border-gray-200 rounded-lg p-4">
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => setExpandedMultiplier(expandedMultiplier === mult.id ? null : mult.id)}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{mult.name}</h4>
                    <p className="text-sm text-gray-600">{mult.description}</p>
                  </div>
                  <span className="text-gray-400">
                    {expandedMultiplier === mult.id ? '▼' : '▶'}
                  </span>
                </div>

                {expandedMultiplier === mult.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value (0.0 - 1.5)
                      </label>
                      <Controller
                        name={`multipliers.${MULTIPLIERS.findIndex((m) => m.id === mult.id)}.value`}
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="0"
                              max="1.5"
                              step="0.05"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="w-20">
                              <input
                                type="number"
                                min="0"
                                max="1.5"
                                step="0.01"
                                value={field.value}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-right"
                              />
                            </div>
                          </div>
                        )}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Optional: Use for additional operational metrics
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Value Legend */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-3">Value Interpretation</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-green-600">1.0 - 1.5</p>
              <p className="text-gray-600">Strong (Above average capability)</p>
            </div>
            <div>
              <p className="font-semibold text-blue-600">0.5 - 0.9</p>
              <p className="text-gray-600">Adequate (Typical capability)</p>
            </div>
            <div>
              <p className="font-semibold text-orange-600">0.0 - 0.4</p>
              <p className="text-gray-600">Weak (Below average capability)</p>
            </div>
          </div>
        </div>

        {/* Sync Button */}
        <div>
          <button
            type="submit"
            disabled={syncing}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {syncing ? '🔄 Syncing...' : '✓ Sync Multipliers & Recalculate'}
          </button>
        </div>

        {/* Result Message */}
        {syncResult && (
          <div className={`p-4 rounded-lg border ${
            syncResult.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`font-semibold mb-2 ${syncResult.success ? 'text-green-900' : 'text-red-900'}`}>
              {syncResult.success ? '✓ Sync Successful' : '✗ Sync Failed'}
            </p>
            {syncResult.success && (
              <div className="text-sm text-green-800">
                <p>• {syncResult.syncedCount} multiplier(s) synced</p>
                {syncResult.invalidCount > 0 && (
                  <p>• {syncResult.invalidCount} multiplier(s) skipped (invalid data)</p>
                )}
                <p className="mt-2">Scores are being recalculated. Check the assessment dashboard for updates.</p>
              </div>
            )}
            {!syncResult.success && (
              <p className="text-sm text-red-800">{syncResult.error}</p>
            )}
          </div>
        )}
      </form>

      {/* Information Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm font-semibold text-blue-900 mb-2">💡 How multipliers work</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Higher multiplier values increase the objective score (M_obj)</li>
          <li>• The health index is calculated from S_sub and M_obj</li>
          <li>• After syncing, all active cycles will automatically recalculate</li>
          <li>• Changes are visible in real-time on the assessment dashboard</li>
        </ul>
      </div>
    </div>
  )
}

export default MultiplierSync

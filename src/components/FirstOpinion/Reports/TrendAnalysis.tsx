/**
 * First Opinion Engine v3 - Trend Analysis
 * Year-over-year comparison and trajectory prediction
 */

import React, { useState, useEffect } from 'react'
import { db } from '../../../lib/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts'

interface CycleScore {
  cycleId: string
  date: Date
  s_sub: number
  m_obj: number
  healthIndex: number
  gap: number
}

interface TrendData {
  month: string
  current: number
  previous: number
  forecast: number
}

interface TrendAnalysisProps {
  schoolId: string
}

const generateForecast = (data: CycleScore[]): number => {
  if (data.length < 2) return data[data.length - 1]?.healthIndex || 50

  const recent = data.slice(-3).map((c) => c.healthIndex)
  const trend = (recent[recent.length - 1] - recent[0]) / (recent.length - 1)
  return Math.min(100, Math.max(0, recent[recent.length - 1] + trend * 3))
}

const getTrendDirection = (values: number[]) => {
  if (values.length < 2) return 'STABLE'
  const change = values[values.length - 1] - values[0]
  if (change > 5) return 'IMPROVING'
  if (change < -5) return 'DECLINING'
  return 'STABLE'
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ schoolId }) => {
  const [currentData, setCurrentData] = useState<CycleScore[]>([])
  const [previousData, setPreviousData] = useState<CycleScore[]>([])
  const [chartData, setChartData] = useState<TrendData[]>([])
  const [trend, setTrend] = useState<'IMPROVING' | 'STABLE' | 'DECLINING'>('STABLE')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true)

        // Fetch assessment cycles for this school
        const cyclesRef = collection(db, 'schools', schoolId, 'assessmentCycles')
        const cyclesSnapshot = await getDocs(cyclesRef)

        const cycles = cyclesSnapshot.docs.map((doc) => ({
          cycleId: doc.id,
          ...doc.data(),
        }))

        // Separate by year (assuming cycleId contains year or createdAt does)
        const now = new Date()
        const currentYear = now.getFullYear()
        const previousYear = currentYear - 1

        const currentCycles = cycles.filter((c) => {
          const cycleDate = c.scores?.lastCalculatedAt?.toDate?.() || new Date()
          return cycleDate.getFullYear() === currentYear
        })

        const previousCycles = cycles.filter((c) => {
          const cycleDate = c.scores?.lastCalculatedAt?.toDate?.() || new Date()
          return cycleDate.getFullYear() === previousYear
        })

        const formatCycleScore = (cycle: any): CycleScore => ({
          cycleId: cycle.cycleId,
          date: cycle.scores?.lastCalculatedAt?.toDate?.() || new Date(),
          s_sub: cycle.scores?.s_sub || 0,
          m_obj: cycle.scores?.m_obj || 0,
          healthIndex: cycle.scores?.healthIndex || 0,
          gap: cycle.scores?.gap || 0,
        })

        const currentScores = currentCycles.map(formatCycleScore).sort((a, b) => a.date.getTime() - b.date.getTime())
        const previousScores = previousCycles.map(formatCycleScore).sort((a, b) => a.date.getTime() - b.date.getTime())

        setCurrentData(currentScores)
        setPreviousData(previousScores)

        // Generate chart data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const data: TrendData[] = months.map((month, index) => {
          const currentScore = currentScores[index]?.healthIndex || previousScores[index]?.healthIndex || 50
          const previousScore = previousScores[index]?.healthIndex || 50
          const forecast = index < currentScores.length
            ? currentScores[index]?.healthIndex || 50
            : generateForecast(currentScores)

          return {
            month,
            current: currentScore,
            previous: previousScore,
            forecast,
          }
        })

        setChartData(data)

        // Determine trend
        const healthValues = currentScores.map((c) => c.healthIndex)
        setTrend(getTrendDirection(healthValues))

        setError(null)
      } catch (err) {
        console.error('Error fetching trend data:', err)
        setError('Failed to load trend data')
      } finally {
        setLoading(false)
      }
    }

    fetchTrendData()
  }, [schoolId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading trend analysis...</p>
        </div>
      </div>
    )
  }

  if (error || chartData.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Insufficient Data</h3>
        <p className="text-yellow-700">Trend analysis requires at least two assessment cycles</p>
      </div>
    )
  }

  const latestCurrent = chartData[chartData.length - 1]?.current || 0
  const latestPrevious = chartData[chartData.length - 1]?.previous || 0
  const improvement = latestCurrent - latestPrevious

  const trendColor = trend === 'IMPROVING' ? 'text-green-600' : trend === 'DECLINING' ? 'text-red-600' : 'text-blue-600'
  const trendIcon = trend === 'IMPROVING' ? '📈' : trend === 'DECLINING' ? '📉' : '➡️'

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Trend Analysis</h2>
        <p className="text-gray-600">Year-over-year comparison and forecast</p>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Score */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-2">Current Year Health Index</p>
          <p className="text-3xl font-bold text-blue-600">{latestCurrent.toFixed(1)}</p>
        </div>

        {/* Previous Score */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">Previous Year Health Index</p>
          <p className="text-3xl font-bold text-gray-600">{latestPrevious.toFixed(1)}</p>
        </div>

        {/* Improvement */}
        <div className={`${improvement > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} p-6 rounded-lg border`}>
          <p className="text-sm font-semibold mb-2 ${improvement > 0 ? 'text-green-900' : 'text-red-900'}">
            Year-over-Year Change
          </p>
          <p className={`text-3xl font-bold ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Trend Direction */}
      <div className={`p-4 rounded-lg border ${
        trend === 'IMPROVING'
          ? 'bg-green-50 border-green-200'
          : trend === 'DECLINING'
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
      }`}>
        <p className={`text-lg font-semibold ${trendColor}`}>
          {trendIcon} Status: {trend === 'IMPROVING' ? 'Improving' : trend === 'DECLINING' ? 'Declining' : 'Stable'}
        </p>
        <p className={`text-sm mt-1 ${trendColor}`}>
          {trend === 'IMPROVING'
            ? 'School health is on an upward trajectory with consistent improvements'
            : trend === 'DECLINING'
              ? 'School health indicators are declining - immediate attention recommended'
              : 'School health remains stable with no significant changes'}
        </p>
      </div>

      {/* YoY Comparison Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Year-over-Year Comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
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
            <Area
              type="monotone"
              dataKey="previous"
              fill="#e5e7eb"
              stroke="#9ca3af"
              name="Previous Year"
              opacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Current Year"
              dot={{ fill: '#3b82f6', r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Forecast"
              dot={{ fill: '#8b5cf6', r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="font-semibold text-indigo-900 mb-2">📊 Key Insights</p>
          <ul className="text-sm text-indigo-800 space-y-1">
            <li>• {chartData.length} months of data available</li>
            <li>• {currentData.length} cycles this year</li>
            <li>• Average health index: {(currentData.reduce((sum, c) => sum + c.healthIndex, 0) / currentData.length || 0).toFixed(1)}</li>
          </ul>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="font-semibold text-purple-900 mb-2">🎯 Recommendations</p>
          <ul className="text-sm text-purple-800 space-y-1">
            {trend === 'IMPROVING' && (
              <>
                <li>• Continue current initiatives</li>
                <li>• Document success factors</li>
                <li>• Scale best practices</li>
              </>
            )}
            {trend === 'DECLINING' && (
              <>
                <li>• Review recent changes</li>
                <li>• Increase stakeholder communication</li>
                <li>• Implement corrective actions</li>
              </>
            )}
            {trend === 'STABLE' && (
              <>
                <li>• Identify growth opportunities</li>
                <li>• Set incremental targets</li>
                <li>• Build on current foundation</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TrendAnalysis

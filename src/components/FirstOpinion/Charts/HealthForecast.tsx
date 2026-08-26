/**
 * First Opinion Engine v3 - Health Forecast Chart
 * 30-day health index forecast with confidence bands
 */

import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { forecastHealthIndex, type CycleMetrics, type Forecast } from '../../../lib/firstOpinion/historicalAnalysis'

interface HealthForecastProps {
  historicalCycles: CycleMetrics[]
  currentHealthIndex: number
}

interface ForecastDataPoint {
  day: number
  forecast: number
  upper: number
  lower: number
}

const getTrendColor = (trend: 'UP' | 'DOWN' | 'FLAT') => {
  switch (trend) {
    case 'UP':
      return '#10b981' // green
    case 'DOWN':
      return '#ef4444' // red
    case 'FLAT':
      return '#f59e0b' // orange
  }
}

const getTrendLabel = (trend: 'UP' | 'DOWN' | 'FLAT') => {
  switch (trend) {
    case 'UP':
      return '📈 Improving'
    case 'DOWN':
      return '📉 Declining'
    case 'FLAT':
      return '→ Stable'
  }
}

export const HealthForecast: React.FC<HealthForecastProps> = ({ historicalCycles, currentHealthIndex }) => {
  const forecast = useMemo(() => {
    if (historicalCycles.length === 0) {
      return {
        predictions: Array(30).fill(currentHealthIndex),
        confidenceUpper: Array(30).fill(100),
        confidenceLower: Array(30).fill(0),
        rSquared: 0,
        trend: 'FLAT' as const,
      }
    }
    return forecastHealthIndex(historicalCycles, 30)
  }, [historicalCycles, currentHealthIndex])

  const chartData = useMemo(() => {
    const data: ForecastDataPoint[] = []
    for (let i = 0; i < forecast.predictions.length; i++) {
      data.push({
        day: i + 1,
        forecast: Math.round(forecast.predictions[i] * 10) / 10,
        upper: Math.round(forecast.confidenceUpper[i] * 10) / 10,
        lower: Math.round(forecast.confidenceLower[i] * 10) / 10,
      })
    }
    return data
  }, [forecast])

  const goodness = (forecast.rSquared * 100).toFixed(1)
  const endForecast = forecast.predictions[forecast.predictions.length - 1]
  const change = endForecast - currentHealthIndex
  const changePercent = ((change / currentHealthIndex) * 100).toFixed(1)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">30-Day Health Index Forecast</h2>
        <p className="text-gray-600">Predicted trajectory based on historical trends with 95% confidence bands</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900 font-semibold mb-1">Current Health</p>
          <p className="text-2xl font-bold text-blue-600">{currentHealthIndex.toFixed(1)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-900 font-semibold mb-1">30-Day Forecast</p>
          <p className="text-2xl font-bold text-purple-600">{endForecast.toFixed(1)}</p>
        </div>

        <div
          className={`bg-gradient-to-br p-4 rounded-lg border ${
            change >= 0
              ? 'from-green-50 to-green-100 border-green-200'
              : 'from-red-50 to-red-100 border-red-200'
          }`}
        >
          <p className={`text-xs font-semibold mb-1 ${change >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            Expected Change
          </p>
          <p
            className={`text-2xl font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {change >= 0 ? '+' : ''}{change.toFixed(1)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-900 font-semibold mb-1">Trend</p>
          <p className="text-lg font-bold text-amber-600">{getTrendLabel(forecast.trend)}</p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Projection</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              label={{ value: 'Days Ahead', position: 'insideBottomRight', offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis domain={[0, 100]} label={{ value: 'Health Index', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              formatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
              labelFormatter={(label) => `Day ${label}`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            {/* Confidence Band */}
            <Area
              type="monotone"
              dataKey="upper"
              fill="#9ca3af"
              stroke="none"
              fillOpacity={0.1}
              name="95% Upper Bound"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="lower"
              fill="#9ca3af"
              stroke="none"
              fillOpacity={0.1}
              name="95% Lower Bound"
              isAnimationActive={false}
            />

            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={getTrendColor(forecast.trend)}
              strokeWidth={3}
              dot={false}
              name="30-Day Forecast"
              isAnimationActive={false}
            />

            {/* Threshold Lines */}
            <ReferenceLine y={75} stroke="#10b981" strokeDasharray="5 5" name="Excellent (75)" />
            <ReferenceLine y={65} stroke="#f59e0b" strokeDasharray="5 5" name="Good (65)" />
            <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="5 5" name="Critical (50)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-semibold mb-2">Forecast Accuracy</p>
          <p className="text-2xl font-bold text-blue-600">{goodness}%</p>
          <p className="text-xs text-blue-700 mt-1">R² goodness of fit</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-900 font-semibold mb-2">30-Day Change</p>
          <p className={`text-2xl font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{changePercent}%
          </p>
          <p className="text-xs text-purple-700 mt-1">Expected percentage change</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900 font-semibold mb-2">Confidence Range</p>
          <p className="text-sm text-amber-700 mt-1">
            {forecast.confidenceLower[forecast.confidenceLower.length - 1].toFixed(1)} →{' '}
            {forecast.confidenceUpper[forecast.confidenceUpper.length - 1].toFixed(1)}
          </p>
          <p className="text-xs text-amber-700">Expected range on day 30</p>
        </div>
      </div>

      {/* Interpretation */}
      <div
        className={`border-l-4 p-4 rounded ${
          forecast.trend === 'UP'
            ? 'bg-green-50 border-green-500 text-green-900'
            : forecast.trend === 'DOWN'
              ? 'bg-red-50 border-red-500 text-red-900'
              : 'bg-yellow-50 border-yellow-500 text-yellow-900'
        }`}
      >
        <p className="font-semibold mb-2">Forecast Interpretation</p>
        <p className="text-sm">
          {forecast.trend === 'UP'
            ? `✓ Positive trend detected. Health index is expected to improve by ${changePercent}% over the next 30 days. Continue current improvement initiatives.`
            : forecast.trend === 'DOWN'
              ? `⚠ Declining trend detected. Health index is expected to decline by ${Math.abs(Number(changePercent))}% over the next 30 days. Immediate action required to reverse this trend.`
              : `→ Stable trend detected. Health index is expected to remain relatively stable over the next 30 days with minor fluctuations.`}
        </p>
      </div>

      {/* Methodology Note */}
      <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded italic">
        <p>
          Forecast uses linear regression on historical cycle data. Confidence bands represent 95% confidence interval (±1.96 standard errors). Accuracy increases with more historical data points.
        </p>
      </div>
    </div>
  )
}

export default HealthForecast

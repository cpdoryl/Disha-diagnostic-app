/**
 * First Opinion Engine v3 - Historical Analysis Engine
 * Trend analysis, forecasting, and pattern detection for predictive early warnings
 */

export interface CycleMetrics {
  cycleId: string
  date: Date
  healthIndex: number
  s_sub: number
  m_obj: number
  gap: number
  respondentCount: number
}

export interface TrendAnalysis {
  direction: 'IMPROVING' | 'STABLE' | 'DECLINING'
  changeRate: number // percentage change per cycle
  strength: number // 0-100, how strong is the trend
  cycles: number // number of cycles used
  confidence: number // 0-100, statistical confidence
}

export interface Forecast {
  predictions: number[] // Next N days (30 by default)
  confidenceUpper: number[] // 95% CI upper bound
  confidenceLower: number[] // 95% CI lower bound
  rSquared: number // Goodness of fit (0-1)
  trend: 'UP' | 'FLAT' | 'DOWN'
}

export interface AnomalyScore {
  responseId: string
  score: number // 0-100, higher = more anomalous
  type: 'PATTERN' | 'OUTLIER' | 'CONSISTENCY' | 'TREND'
  confidence: number // 0-100
  details: string
}

export interface SeasonalFactor {
  month: number // 1-12
  factor: number // Adjustment factor, 1.0 = neutral
  confidence: number // 0-100
}

/**
 * Calculate trend direction and strength from historical cycles
 */
export function analyzeTrend(cycles: CycleMetrics[]): TrendAnalysis {
  if (cycles.length < 2) {
    return {
      direction: 'STABLE',
      changeRate: 0,
      strength: 0,
      cycles: cycles.length,
      confidence: 0,
    }
  }

  // Sort by date
  const sorted = [...cycles].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Calculate health index changes
  const changes: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    const change = sorted[i].healthIndex - sorted[i - 1].healthIndex
    changes.push(change)
  }

  // Calculate average change rate
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length
  const changeRate = (avgChange / sorted[0].healthIndex) * 100 // Percentage

  // Determine direction
  let direction: 'IMPROVING' | 'STABLE' | 'DECLINING'
  if (Math.abs(avgChange) < 2) {
    direction = 'STABLE'
  } else if (avgChange > 0) {
    direction = 'IMPROVING'
  } else {
    direction = 'DECLINING'
  }

  // Calculate trend strength (0-100)
  const trend = calculateLinearRegression(sorted.map(c => c.healthIndex))
  const strength = Math.min(100, Math.abs(trend.slope) * 10)

  // Calculate confidence based on consistency
  const variance = calculateVariance(changes)
  const confidence = Math.max(0, 100 - variance * 5)

  return {
    direction,
    changeRate,
    strength,
    cycles: sorted.length,
    confidence,
  }
}

/**
 * Forecast health index for next N days using linear regression
 */
export function forecastHealthIndex(cycles: CycleMetrics[], days: number = 30): Forecast {
  if (cycles.length < 2) {
    return {
      predictions: Array(days).fill(cycles[0]?.healthIndex ?? 50),
      confidenceUpper: Array(days).fill(100),
      confidenceLower: Array(days).fill(0),
      rSquared: 0,
      trend: 'FLAT',
    }
  }

  // Sort by date and normalize to numeric x-axis
  const sorted = [...cycles].sort((a, b) => a.date.getTime() - b.date.getTime())
  const healthScores = sorted.map(c => c.healthIndex)

  // Fit linear regression
  const regression = calculateLinearRegression(healthScores)

  // Generate predictions
  const predictions: number[] = []
  const confidenceUpper: number[] = []
  const confidenceLower: number[] = []

  // Residual standard error for confidence bands
  const residuals = healthScores.map((y, i) => y - (regression.intercept + regression.slope * i))
  const residualSE = Math.sqrt(residuals.reduce((a, b) => a + b * b, 0) / Math.max(1, residuals.length - 2))

  for (let i = 0; i < days; i++) {
    const x = healthScores.length + i
    const pred = Math.max(0, Math.min(100, regression.intercept + regression.slope * x))
    predictions.push(pred)

    // 95% confidence interval (1.96 * SE)
    const margin = 1.96 * residualSE * Math.sqrt(1 + 1 / healthScores.length)
    confidenceUpper.push(Math.min(100, pred + margin))
    confidenceLower.push(Math.max(0, pred - margin))
  }

  // Determine trend
  let trend: 'UP' | 'FLAT' | 'DOWN'
  if (Math.abs(regression.slope) < 0.1) {
    trend = 'FLAT'
  } else if (regression.slope > 0) {
    trend = 'UP'
  } else {
    trend = 'DOWN'
  }

  return {
    predictions,
    confidenceUpper,
    confidenceLower,
    rSquared: regression.rSquared,
    trend,
  }
}

/**
 * Detect cyclical/seasonal patterns in historical data
 */
export function detectSeasonalPatterns(cycles: CycleMetrics[]): SeasonalFactor[] {
  if (cycles.length < 12) {
    // Need at least 12 cycles for meaningful seasonal analysis
    return []
  }

  const monthlyScores: Map<number, number[]> = new Map()

  // Group by month
  cycles.forEach(cycle => {
    const month = cycle.date.getMonth() + 1
    if (!monthlyScores.has(month)) {
      monthlyScores.set(month, [])
    }
    monthlyScores.get(month)!.push(cycle.healthIndex)
  })

  // Calculate seasonal factors
  const overallAvg = cycles.reduce((sum, c) => sum + c.healthIndex, 0) / cycles.length
  const factors: SeasonalFactor[] = []

  for (let month = 1; month <= 12; month++) {
    const scores = monthlyScores.get(month) || []
    if (scores.length === 0) continue

    const monthAvg = scores.reduce((a, b) => a + b, 0) / scores.length
    const factor = overallAvg > 0 ? monthAvg / overallAvg : 1.0
    const variance = calculateVariance(scores)
    const confidence = Math.max(0, 100 - variance * 5)

    factors.push({
      month,
      factor,
      confidence,
    })
  }

  return factors
}

/**
 * Identify statistical outliers in cycle data
 */
export function identifyOutliers(cycles: CycleMetrics[]): AnomalyScore[] {
  if (cycles.length < 3) {
    return []
  }

  const healthScores = cycles.map(c => c.healthIndex)
  const mean = healthScores.reduce((a, b) => a + b, 0) / healthScores.length
  const stdDev = Math.sqrt(
    healthScores.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / healthScores.length
  )

  const anomalies: AnomalyScore[] = []

  cycles.forEach((cycle, index) => {
    const zScore = Math.abs((cycle.healthIndex - mean) / (stdDev || 1))

    // Flag if more than 2 standard deviations from mean
    if (zScore > 2) {
      const confidence = Math.min(100, zScore * 25)
      const score = Math.min(100, zScore * 30)

      anomalies.push({
        responseId: cycle.cycleId,
        score,
        type: 'OUTLIER',
        confidence,
        details: `Health Index ${cycle.healthIndex} is ${zScore.toFixed(1)}σ from mean (${mean.toFixed(1)})`,
      })
    }
  })

  return anomalies
}

/**
 * Detect inconsistency patterns between S_sub and M_obj
 */
export function detectConsistencyAnomalies(cycles: CycleMetrics[]): AnomalyScore[] {
  if (cycles.length < 2) {
    return []
  }

  const sorted = [...cycles].sort((a, b) => a.date.getTime() - b.date.getTime())
  const anomalies: AnomalyScore[] = []

  // Check for diverging trends (S_sub up, M_obj down)
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]

    const sSubChange = curr.s_sub - prev.s_sub
    const mObjChange = curr.m_obj - prev.m_obj

    // Diverging: S_sub improves while M_obj deteriorates
    if (sSubChange > 5 && mObjChange < -5) {
      const confidence = Math.min(100, Math.abs(sSubChange) + Math.abs(mObjChange))
      anomalies.push({
        responseId: curr.cycleId,
        score: 75,
        type: 'CONSISTENCY',
        confidence,
        details: `Diverging trend: S_sub +${sSubChange.toFixed(1)}, M_obj ${mObjChange.toFixed(1)} (potential delusional comfort)`,
      })
    }

    // False recovery: Health improves only from S_sub, not M_obj
    if (curr.healthIndex > prev.healthIndex && sSubChange > 3 && Math.abs(mObjChange) < 2) {
      anomalies.push({
        responseId: curr.cycleId,
        score: 60,
        type: 'CONSISTENCY',
        confidence: 80,
        details: `Perception-driven recovery: Health +${(curr.healthIndex - prev.healthIndex).toFixed(1)} but M_obj unchanged`,
      })
    }
  }

  return anomalies
}

/**
 * Calculate pattern anomalies in challenge response distribution
 */
export function detectPatternAnomalies(severities: number[]): AnomalyScore[] {
  if (severities.length === 0) return []

  const anomalies: AnomalyScore[] = []

  // Check for all max or all min (suspicious patterns)
  const allMax = severities.every(s => s >= 9)
  const allMin = severities.every(s => s <= 2)

  if (allMax || allMin) {
    anomalies.push({
      responseId: 'pattern-all-extreme',
      score: 85,
      type: 'PATTERN',
      confidence: 95,
      details: `All responses ${allMax ? 'maximized (9-10)' : 'minimized (1-2)'} - possible non-serious response`,
    })
  }

  // Check for suspicious clustering (too uniform distribution)
  const unique = new Set(severities).size
  if (unique <= 2) {
    anomalies.push({
      responseId: 'pattern-clustering',
      score: 70,
      type: 'PATTERN',
      confidence: 85,
      details: `Only ${unique} unique values in ${severities.length} responses - low variance`,
    })
  }

  // Check for bimodal distribution (possible two distinct groups)
  const sorted = [...severities].sort((a, b) => a - b)
  const gapLarge = sorted[Math.floor(severities.length / 2)] - sorted[Math.floor(severities.length / 2) - 1] > 4
  if (severities.length >= 6 && gapLarge) {
    anomalies.push({
      responseId: 'pattern-bimodal',
      score: 50,
      type: 'PATTERN',
      confidence: 70,
      details: `Possible two distinct groups detected in responses`,
    })
  }

  return anomalies
}

// ============ Helper Functions ============

interface LinearRegression {
  slope: number
  intercept: number
  rSquared: number
}

function calculateLinearRegression(y: number[]): LinearRegression {
  if (y.length < 2) {
    return { slope: 0, intercept: y[0] ?? 50, rSquared: 0 }
  }

  const n = y.length
  const x = Array.from({ length: n }, (_, i) => i) // [0, 1, 2, ...]

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R²
  const yMean = sumY / n
  const ssRes = y.reduce((sum, yi) => sum + Math.pow(yi - (intercept + slope * x[y.indexOf(yi)]), 2), 0)
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot

  return { slope, intercept, rSquared: Math.max(0, rSquared) }
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / values.length
}

export default {
  analyzeTrend,
  forecastHealthIndex,
  detectSeasonalPatterns,
  identifyOutliers,
  detectConsistencyAnomalies,
  detectPatternAnomalies,
}

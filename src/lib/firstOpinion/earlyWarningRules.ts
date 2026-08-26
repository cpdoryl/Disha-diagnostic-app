/**
 * First Opinion Engine v3 - Early Warning Rules Engine
 * Rule-based warning generation and anomaly scoring
 */

export type WarningLevel = 'GREEN' | 'YELLOW' | 'RED' | 'CRITICAL'

export interface RiskFactor {
  name: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  value: number
  threshold: number
  description: string
}

export interface AlertAction {
  priority: 1 | 2 | 3
  title: string
  description: string
  timeline: string
  owner?: string
}

export interface EarlyWarning {
  level: WarningLevel
  score: number // 0-100
  factors: RiskFactor[]
  actions: AlertAction[]
  interpretation: string
  lastUpdated: Date
}

export interface ThresholdConfig {
  criticalHealth: number // < this = CRITICAL
  redHealth: number // < this = RED
  yellowHealth: number // < this = YELLOW
  maxGap: number // > this = escalate
  minRespondents: number // < this = escalate
}

const DEFAULT_THRESHOLDS: ThresholdConfig = {
  criticalHealth: 40,
  redHealth: 50,
  yellowHealth: 65,
  maxGap: 25,
  minRespondents: 20,
}

/**
 * Evaluate health thresholds and determine base warning level
 */
export function evaluateHealthThresholds(
  healthIndex: number,
  config: ThresholdConfig = DEFAULT_THRESHOLDS
): WarningLevel {
  if (healthIndex < config.criticalHealth) return 'CRITICAL'
  if (healthIndex < config.redHealth) return 'RED'
  if (healthIndex < config.yellowHealth) return 'YELLOW'
  return 'GREEN'
}

/**
 * Calculate overall anomaly risk score (1-10 scale)
 */
export function scoreAnomalyRisk(
  healthIndex: number,
  gap: number,
  s_sub: number,
  m_obj: number,
  respondentCount: number,
  trendDirection?: 'IMPROVING' | 'STABLE' | 'DECLINING',
  config: ThresholdConfig = DEFAULT_THRESHOLDS
): number {
  let risk = 1 // Base risk

  // Health index risk
  if (healthIndex < config.criticalHealth) risk += 3
  else if (healthIndex < config.redHealth) risk += 2.5
  else if (healthIndex < config.yellowHealth) risk += 1.5
  else if (healthIndex >= 75) risk += 0 // No additional risk

  // Gap risk
  if (gap > config.maxGap) risk += 2
  else if (gap > 15) risk += 1

  // S_sub vs M_obj imbalance
  const imbalance = Math.abs(s_sub - m_obj)
  if (imbalance > 20) risk += 2
  else if (imbalance > 10) risk += 1

  // Respondent count risk
  if (respondentCount < config.minRespondents) risk += 1.5
  else if (respondentCount < 30) risk += 0.5

  // Trend risk
  if (trendDirection === 'DECLINING') risk += 1.5
  else if (trendDirection === 'STABLE') risk += 0

  // Delusion penalty risk
  if (s_sub > 80) risk += 1 // High subjective score with penalty

  return Math.min(10, risk)
}

/**
 * Identify risk factors and generate warning details
 */
export function identifyRiskFactors(
  healthIndex: number,
  gap: number,
  s_sub: number,
  m_obj: number,
  respondentCount: number,
  quadrant: string,
  trendDirection?: 'IMPROVING' | 'STABLE' | 'DECLINING',
  config: ThresholdConfig = DEFAULT_THRESHOLDS
): RiskFactor[] {
  const factors: RiskFactor[] = []

  // Health Index factors
  if (healthIndex < config.criticalHealth) {
    factors.push({
      name: 'Critical Health Index',
      severity: 'CRITICAL',
      value: healthIndex,
      threshold: config.criticalHealth,
      description: `Health index at ${healthIndex.toFixed(1)} requires immediate intervention`,
    })
  } else if (healthIndex < config.redHealth) {
    factors.push({
      name: 'Low Health Index',
      severity: 'HIGH',
      value: healthIndex,
      threshold: config.redHealth,
      description: `Health index at ${healthIndex.toFixed(1)} indicates serious operational challenges`,
    })
  } else if (healthIndex < config.yellowHealth) {
    factors.push({
      name: 'Suboptimal Health Index',
      severity: 'MEDIUM',
      value: healthIndex,
      threshold: config.yellowHealth,
      description: `Health index at ${healthIndex.toFixed(1)} suggests room for improvement`,
    })
  }

  // Gap factors
  if (gap > config.maxGap) {
    factors.push({
      name: 'Perception-Reality Gap',
      severity: 'HIGH',
      value: gap,
      threshold: config.maxGap,
      description: `Large gap of ${gap.toFixed(1)} indicates stakeholders overestimate performance`,
    })
  }

  // S_sub vs M_obj balance
  const imbalance = Math.abs(s_sub - m_obj)
  if (imbalance > 20) {
    factors.push({
      name: 'Leadership-Operational Imbalance',
      severity: 'HIGH',
      value: imbalance,
      threshold: 20,
      description:
        imbalance > 0 && s_sub > m_obj
          ? `Leadership perception (${s_sub.toFixed(1)}) significantly exceeds operational reality (${m_obj.toFixed(1)})`
          : `Operational reality (${m_obj.toFixed(1)}) exceeds leadership perception (${s_sub.toFixed(1)})`,
    })
  }

  // Respondent count
  if (respondentCount < config.minRespondents) {
    factors.push({
      name: 'Low Response Rate',
      severity: 'MEDIUM',
      value: respondentCount,
      threshold: config.minRespondents,
      description: `Only ${respondentCount} respondents; recommend ${config.minRespondents}+ for reliable assessment`,
    })
  }

  // Trend factors
  if (trendDirection === 'DECLINING') {
    factors.push({
      name: 'Declining Trend',
      severity: 'HIGH',
      value: 1,
      threshold: 0,
      description: 'Health index trending downward across recent cycles',
    })
  }

  // Delusion penalty
  if (s_sub > 80) {
    factors.push({
      name: 'Overconfidence Indicator',
      severity: 'MEDIUM',
      value: s_sub,
      threshold: 80,
      description: `High subjective score (${s_sub.toFixed(1)}) with operational gaps suggests potential blind spots`,
    })
  }

  // Quadrant-based factors
  if (quadrant === 'PERCEPTION_BETTER') {
    factors.push({
      name: 'Blind Spot Risk',
      severity: 'HIGH',
      value: 1,
      threshold: 0,
      description: 'Stakeholder perception exceeds operational reality - risk of complacency',
    })
  }

  return factors
}

/**
 * Generate recommended actions based on warning level and factors
 */
export function generateRecommendedActions(
  warningLevel: WarningLevel,
  factors: RiskFactor[],
  healthIndex: number,
  gap: number
): AlertAction[] {
  const actions: AlertAction[] = []

  // Base actions by warning level
  switch (warningLevel) {
    case 'CRITICAL':
      actions.push({
        priority: 1,
        title: 'Emergency Response Team Assembly',
        description: 'Convene leadership crisis team within 24 hours to assess and respond',
        timeline: 'Immediate (< 24 hours)',
        owner: 'Principal',
      })
      actions.push({
        priority: 1,
        title: 'Comprehensive Assessment & Stabilization',
        description: 'Conduct rapid needs assessment across all dimensions, implement quick-win stabilization measures',
        timeline: '0-15 days',
        owner: 'Crisis Team',
      })
      break

    case 'RED':
      actions.push({
        priority: 1,
        title: 'Structured Improvement Initiative',
        description: 'Develop and launch structured improvement roadmap with clear milestones',
        timeline: '1-3 weeks',
        owner: 'Management',
      })
      actions.push({
        priority: 2,
        title: 'Stakeholder Communication',
        description: 'Communicate challenges and improvement plan transparently with all stakeholders',
        timeline: '0-1 week',
        owner: 'Principal',
      })
      break

    case 'YELLOW':
      actions.push({
        priority: 2,
        title: 'Targeted Improvement Program',
        description: 'Focus on specific underperforming areas with dedicated improvement teams',
        timeline: '2-4 weeks',
        owner: 'Department Heads',
      })
      actions.push({
        priority: 3,
        title: 'Progress Monitoring',
        description: 'Set up monthly monitoring to track improvement metrics',
        timeline: 'Ongoing',
        owner: 'Management',
      })
      break

    case 'GREEN':
      actions.push({
        priority: 3,
        title: 'Maintain Excellence',
        description: 'Continue current practices, explore areas for competitive differentiation',
        timeline: 'Ongoing',
        owner: 'All Teams',
      })
      break
  }

  // Add factor-specific actions
  const hasGapFactor = factors.some(f => f.name === 'Perception-Reality Gap')
  if (hasGapFactor && gap > DEFAULT_THRESHOLDS.maxGap) {
    actions.push({
      priority: 1,
      title: 'Address Perception-Reality Gap',
      description: 'Conduct transparent data-sharing sessions with stakeholders, establish joint problem-solving',
      timeline: '0-30 days',
      owner: 'Principal',
    })
  }

  const hasImbalanceFactor = factors.some(f => f.name === 'Leadership-Operational Imbalance')
  if (hasImbalanceFactor) {
    actions.push({
      priority: 2,
      title: 'Align Leadership & Operations',
      description: 'Review operational metrics with leadership, identify and address discrepancies',
      timeline: '1-2 weeks',
      owner: 'Management',
    })
  }

  const hasDeclineFactor = factors.some(f => f.name === 'Declining Trend')
  if (hasDeclineFactor) {
    actions.push({
      priority: 1,
      title: 'Arrest Declining Trend',
      description: 'Investigate root causes of decline, implement corrective measures immediately',
      timeline: '0-1 week',
      owner: 'Principal',
    })
  }

  const hasOverconfidence = factors.some(f => f.name === 'Overconfidence Indicator')
  if (hasOverconfidence) {
    actions.push({
      priority: 2,
      title: 'Reality Check & Blind Spot Analysis',
      description: 'Facilitate honest assessment of operational challenges, identify blind spots',
      timeline: '1-2 weeks',
      owner: 'External Consultant',
    })
  }

  return actions
}

/**
 * Generate comprehensive early warning with interpretation
 */
export function generateEarlyWarning(
  healthIndex: number,
  gap: number,
  s_sub: number,
  m_obj: number,
  respondentCount: number,
  quadrant: string,
  trendDirection?: 'IMPROVING' | 'STABLE' | 'DECLINING',
  config: ThresholdConfig = DEFAULT_THRESHOLDS
): EarlyWarning {
  // Determine warning level
  const baseLevel = evaluateHealthThresholds(healthIndex, config)
  let level = baseLevel

  // Escalate if declining trend
  if (trendDirection === 'DECLINING') {
    if (level === 'GREEN') level = 'YELLOW'
    else if (level === 'YELLOW') level = 'RED'
    else if (level === 'RED') level = 'CRITICAL'
  }

  // Escalate if gap is very large
  if (gap > config.maxGap && level !== 'CRITICAL') {
    if (level === 'GREEN') level = 'YELLOW'
    else if (level === 'YELLOW') level = 'RED'
  }

  // Identify risk factors
  const factors = identifyRiskFactors(healthIndex, gap, s_sub, m_obj, respondentCount, quadrant, trendDirection, config)

  // Generate recommended actions
  const actions = generateRecommendedActions(level, factors, healthIndex, gap)

  // Calculate risk score (0-100)
  const riskScore = scoreAnomalyRisk(healthIndex, gap, s_sub, m_obj, respondentCount, trendDirection, config) * 10

  // Generate interpretation
  const interpretation = generateInterpretation(level, healthIndex, gap, trendDirection, factors)

  return {
    level,
    score: Math.min(100, riskScore),
    factors,
    actions,
    interpretation,
    lastUpdated: new Date(),
  }
}

/**
 * Generate human-readable interpretation of warning
 */
function generateInterpretation(
  level: WarningLevel,
  healthIndex: number,
  gap: number,
  trend?: string,
  factors: RiskFactor[] = []
): string {
  let text = ''

  switch (level) {
    case 'CRITICAL':
      text = `🔴 CRITICAL: Health index at ${healthIndex.toFixed(1)} indicates severe operational challenges requiring immediate intervention across all dimensions.`
      break
    case 'RED':
      text = `🔴 RED: Health index at ${healthIndex.toFixed(1)} shows significant operational issues. Structured improvement initiatives must begin immediately.`
      break
    case 'YELLOW':
      text = `🟡 YELLOW: Health index at ${healthIndex.toFixed(1)} is adequate but shows room for improvement. Monitor trends closely.`
      break
    case 'GREEN':
      text = `🟢 GREEN: Health index at ${healthIndex.toFixed(1)} indicates strong performance. Continue current trajectory and explore growth opportunities.`
      break
  }

  if (gap > 25) {
    text += ` Significant perception-reality gap (${gap.toFixed(1)}) suggests stakeholders overestimate performance.`
  }

  if (trend === 'DECLINING') {
    text += ` ⚠️ DECLINING TREND: Scores are deteriorating—urgent action needed to reverse direction.`
  } else if (trend === 'IMPROVING') {
    text += ` ✓ IMPROVING TREND: Positive momentum detected—continue current improvement efforts.`
  }

  return text
}

// Export default config
export const DEFAULT_WARNING_CONFIG: ThresholdConfig = DEFAULT_THRESHOLDS

export default {
  evaluateHealthThresholds,
  scoreAnomalyRisk,
  identifyRiskFactors,
  generateRecommendedActions,
  generateEarlyWarning,
  DEFAULT_WARNING_CONFIG,
}

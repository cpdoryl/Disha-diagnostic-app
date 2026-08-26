/**
 * First Opinion Engine v3 - Recommendations Engine
 * AI-powered improvement recommendations based on diagnostic analysis
 */

import React, { useMemo } from 'react'

interface Recommendation {
  id: string
  priority: 1 | 2 | 3
  category: string
  title: string
  description: string
  reasoning: string
  impact: string
  timeline: string
  actions: string[]
  estimatedCost: 'Low' | 'Medium' | 'High'
}

interface RecommendationsEngineProps {
  s_sub: number
  m_obj: number
  healthIndex: number
  gap: number
  quadrant: string
  interpretation?: string
  respondentCount?: number
}

const generateRecommendations = (props: RecommendationsEngineProps): Recommendation[] => {
  const recommendations: Recommendation[] = []

  // Gap-based recommendations
  if (props.gap > 25 && props.quadrant === 'PERCEPTION_BETTER') {
    recommendations.push({
      id: 'gap-001',
      priority: 1,
      category: 'Strategic',
      title: 'Address Perception-Reality Gap',
      description:
        'Significant gap detected between stakeholder perception and operational reality. This misalignment requires immediate strategic intervention.',
      reasoning: `Gap of ${props.gap.toFixed(1)} points with perception exceeding reality indicates that stakeholders overestimate school performance. This can lead to complacency and missed improvement opportunities.`,
      impact: 'Improved stakeholder alignment, better decision-making, increased accountability',
      timeline: '0-30 days',
      actions: [
        'Conduct transparent stakeholder communication sessions',
        'Share factual performance data with all stakeholders',
        'Establish joint problem-solving committees',
        'Create visible action plans addressing identified gaps',
      ],
      estimatedCost: 'Low',
    })
  }

  // Health-based critical interventions
  if (props.healthIndex < 40) {
    recommendations.push({
      id: 'health-001',
      priority: 1,
      category: 'Critical',
      title: 'Emergency Improvement Initiative',
      description:
        'Health index critically low. Immediate comprehensive intervention required to address fundamental operational challenges.',
      reasoning: `Health index of ${props.healthIndex.toFixed(1)} indicates severe operational distress. Swift, coordinated action across all dimensions is essential.`,
      impact: 'Stabilization of operations, improved stakeholder confidence, foundation for recovery',
      timeline: 'Immediate (0-15 days)',
      actions: [
        'Establish crisis management team',
        'Conduct comprehensive needs assessment',
        'Develop and execute rapid stabilization plan',
        'Implement daily monitoring and adjustment protocols',
        'Secure necessary resources and support',
      ],
      estimatedCost: 'High',
    })
  } else if (props.healthIndex < 55) {
    recommendations.push({
      id: 'health-002',
      priority: 1,
      category: 'Operational',
      title: 'Comprehensive Improvement Program',
      description:
        'Health index below target. Structured, systematic improvement efforts needed across multiple dimensions.',
      reasoning: `Health index of ${props.healthIndex.toFixed(1)} requires coordinated improvement initiatives. Current performance level is not sustainable long-term.`,
      impact: 'Strengthened operations, improved stakeholder satisfaction, sustainable growth',
      timeline: '1-3 months',
      actions: [
        'Develop detailed improvement roadmap',
        'Allocate resources to priority areas',
        'Establish governance and accountability structures',
        'Implement monitoring dashboards',
        'Build capacity in weak areas',
      ],
      estimatedCost: 'Medium',
    })
  } else if (props.healthIndex < 75) {
    recommendations.push({
      id: 'health-003',
      priority: 2,
      category: 'Developmental',
      title: 'Targeted Enhancement Program',
      description:
        'School is performing adequately. Focus on targeted improvements to specific weak areas and sustained excellence.',
      reasoning: `Health index of ${props.healthIndex.toFixed(1)} shows solid foundation. Targeted intervention can accelerate progress to excellence level.`,
      impact: 'Progression toward excellence, competitive advantage, stakeholder confidence',
      timeline: '3-6 months',
      actions: [
        'Identify specific underperforming dimensions',
        'Develop targeted intervention plans',
        'Build on existing strengths',
        'Monitor progress against benchmarks',
        'Share successes with stakeholders',
      ],
      estimatedCost: 'Medium',
    })
  }

  // Subjective-Objective balance recommendations
  if (Math.abs(props.s_sub - props.m_obj) > 15) {
    if (props.s_sub > props.m_obj) {
      recommendations.push({
        id: 'balance-001',
        priority: 2,
        category: 'Operational',
        title: 'Improve Objective Performance',
        description:
          'Subjective perception exceeds objective metrics. Focus on improving actual operational performance to match stakeholder confidence.',
        reasoning: `Leadership perception (${props.s_sub.toFixed(1)}) significantly outpaces operational metrics (${props.m_obj.toFixed(1)}). This suggests stakeholders are underestimating challenges or operational metrics need improvement.`,
        impact: 'Aligned performance, reduced risk, improved effectiveness',
        timeline: '1-3 months',
        actions: [
          'Audit all key operational processes',
          'Identify bottlenecks and inefficiencies',
          'Implement process improvements',
          'Strengthen data collection and metrics',
          'Share progress transparently',
        ],
        estimatedCost: 'Medium',
      })
    } else {
      recommendations.push({
        id: 'balance-002',
        priority: 2,
        category: 'Communication',
        title: 'Improve Stakeholder Communication',
        description:
          'Operational performance exceeds stakeholder perception. Strengthen communication to build confidence and leverage strengths.',
        reasoning: `Operational metrics (${props.m_obj.toFixed(1)}) outpace leadership perception (${props.s_sub.toFixed(1)}). Positive work is not being recognized or communicated effectively.`,
        impact: 'Improved stakeholder satisfaction, better support for improvements, reduced pessimism',
        timeline: '0-30 days',
        actions: [
          'Increase stakeholder communication frequency',
          'Share positive performance data',
          'Celebrate successes publicly',
          'Provide transparent performance dashboards',
          'Conduct listening sessions to understand perceptions',
        ],
        estimatedCost: 'Low',
      })
    }
  }

  // Performance sustaining for high-performing schools
  if (props.healthIndex >= 75) {
    recommendations.push({
      id: 'sustain-001',
      priority: 2,
      category: 'Strategic',
      title: 'Sustain Excellence & Build Competitive Advantage',
      description:
        'School is performing at an excellent level. Focus on sustaining excellence while exploring differentiation opportunities.',
      reasoning: `Health index of ${props.healthIndex.toFixed(1)} demonstrates strong operations. The challenge now is maintaining momentum and exploring strategic growth.`,
      impact: 'Sustained excellence, competitive positioning, stakeholder loyalty',
      timeline: 'Ongoing',
      actions: [
        'Establish excellence maintenance protocols',
        'Identify new differentiation opportunities',
        'Build on reputation for quality',
        'Explore expansion possibilities',
        'Invest in innovation and continuous improvement',
      ],
      estimatedCost: 'Medium',
    })
  }

  // Respondent-engagement based recommendations
  if (props.respondentCount && props.respondentCount < 20) {
    recommendations.push({
      id: 'response-001',
      priority: 2,
      category: 'Engagement',
      title: 'Increase Stakeholder Participation',
      description:
        'Low respondent count limits assessment reliability. Expand stakeholder engagement to get more comprehensive perspective.',
      reasoning: `Only ${props.respondentCount} respondents provided input. A larger sample (30-50+) would provide more reliable insights for decision-making.`,
      impact: 'More robust analysis, better stakeholder buy-in, improved assessment reliability',
      timeline: 'Continuous',
      actions: [
        'Increase communication about assessment importance',
        'Make survey process more convenient',
        'Provide incentives for participation',
        'Follow up with non-respondents',
        'Gather feedback on survey itself',
      ],
      estimatedCost: 'Low',
    })
  }

  return recommendations.sort((a, b) => a.priority - b.priority)
}

export const RecommendationsEngine: React.FC<RecommendationsEngineProps> = (props) => {
  const recommendations = useMemo(() => generateRecommendations(props), [props])

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1:
        return 'bg-red-100 border-red-500 text-red-900'
      case 2:
        return 'bg-yellow-100 border-yellow-500 text-yellow-900'
      case 3:
        return 'bg-blue-100 border-blue-500 text-blue-900'
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900'
    }
  }

  const getPriorityBadge = (priority: number): string => {
    switch (priority) {
      case 1:
        return '🔴 CRITICAL'
      case 2:
        return '🟠 HIGH'
      case 3:
        return '🟡 MEDIUM'
      default:
        return 'INFO'
    }
  }

  const getCostBadge = (cost: string): string => {
    switch (cost) {
      case 'Low':
        return '💰'
      case 'Medium':
        return '💰💰'
      case 'High':
        return '💰💰💰'
      default:
        return '-'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Strategic Recommendations</h2>
        <p className="text-gray-600">AI-powered improvement suggestions based on diagnostic analysis</p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Recommendation Summary</h3>
        <p className="text-sm text-blue-800">
          {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} generated based on your assessment
          results. Total priority: {recommendations.filter(r => r.priority === 1).length} critical,{' '}
          {recommendations.filter(r => r.priority === 2).length} high-priority items.
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <div
            key={rec.id}
            className={`border-l-4 p-6 rounded-lg ${getPriorityColor(rec.priority)}`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{rec.title}</h3>
                <p className="text-sm opacity-75">{rec.description}</p>
              </div>
              <div className="text-right ml-4">
                <span className={`inline-block px-3 py-1 rounded font-bold text-xs mb-2`}>
                  {getPriorityBadge(rec.priority)}
                </span>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold opacity-75 mb-1">CATEGORY</p>
                <p className="text-sm font-medium">{rec.category}</p>
              </div>
              <div>
                <p className="text-xs font-semibold opacity-75 mb-1">TIMELINE</p>
                <p className="text-sm font-medium">{rec.timeline}</p>
              </div>
              <div>
                <p className="text-xs font-semibold opacity-75 mb-1">ESTIMATED COST</p>
                <p className="text-sm font-medium">{getCostBadge(rec.estimatedCost)} {rec.estimatedCost}</p>
              </div>
              <div>
                <p className="text-xs font-semibold opacity-75 mb-1">EXPECTED IMPACT</p>
                <p className="text-sm font-medium">{rec.impact}</p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="mb-4 p-3 bg-white bg-opacity-50 rounded">
              <p className="text-sm font-semibold opacity-75 mb-1">WHY THIS MATTERS</p>
              <p className="text-sm">{rec.reasoning}</p>
            </div>

            {/* Action Items */}
            <div>
              <p className="text-sm font-semibold opacity-75 mb-2">ACTION ITEMS</p>
              <ul className="space-y-1">
                {rec.actions.map((action, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="font-bold opacity-75">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Implementation Roadmap */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Roadmap</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center font-bold mx-auto mb-2">
                0-15
              </div>
              <p className="text-xs font-semibold">Days</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Immediate Actions</p>
              <p className="text-sm text-gray-600">
                Address critical gaps identified. Establish governance, communicate with stakeholders, begin rapid stabilization.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold mx-auto mb-2">
                1-3
              </div>
              <p className="text-xs font-semibold">Months</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Short-Term Initiatives</p>
              <p className="text-sm text-gray-600">
                Implement structured improvements, build capacity, monitor progress, refine based on results.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mx-auto mb-2">
                3-6
              </div>
              <p className="text-xs font-semibold">Months</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Medium-Term Consolidation</p>
              <p className="text-sm text-gray-600">
                Consolidate gains, scale successful initiatives, build on momentum, achieve sustainable improvement.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mx-auto mb-2">
                6-12
              </div>
              <p className="text-xs font-semibold">Months</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Long-Term Excellence</p>
              <p className="text-sm text-gray-600">
                Achieve target health index, close perception-reality gaps, build sustainable competitive advantage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics to Track */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics to Track</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded border border-purple-100">
            <p className="font-semibold text-sm text-gray-900">Health Index Progress</p>
            <p className="text-xs text-gray-600 mt-1">Current: {props.healthIndex.toFixed(1)} → Target: 75+</p>
          </div>
          <div className="p-3 bg-white rounded border border-purple-100">
            <p className="font-semibold text-sm text-gray-900">Perception-Reality Gap</p>
            <p className="text-xs text-gray-600 mt-1">Current: {props.gap.toFixed(1)} → Target: {'<'}10</p>
          </div>
          <div className="p-3 bg-white rounded border border-purple-100">
            <p className="font-semibold text-sm text-gray-900">Stakeholder Satisfaction</p>
            <p className="text-xs text-gray-600 mt-1">Baseline: Not yet measured → Target: 80%+</p>
          </div>
          <div className="p-3 bg-white rounded border border-purple-100">
            <p className="font-semibold text-sm text-gray-900">Objective Performance</p>
            <p className="text-xs text-gray-600 mt-1">Current: {props.m_obj.toFixed(1)} → Target: {props.s_sub > props.m_obj ? props.s_sub.toFixed(1) : '85'}+</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendationsEngine

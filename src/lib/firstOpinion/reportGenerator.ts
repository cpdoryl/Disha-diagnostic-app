/**
 * First Opinion Engine v3 - Report Generator
 * Generates comprehensive diagnostic reports (PDF/HTML export)
 */

interface ReportData {
  schoolName: string
  schoolId: string
  cycleId: string
  generatedAt: Date

  // Core metrics
  s_sub: number
  m_obj: number
  healthIndex: number
  gap: number
  quadrant: string
  interpretation: string

  // Respondent data
  respondentCount: number
  respondentsByRole?: Record<string, number>

  // Challenge data
  challenges?: Array<{
    id: string
    title: string
    domain: string
    severity: number
  }>

  // Trends
  previousYearHealthIndex?: number
  yearOverYearChange?: number
  trend?: 'IMPROVING' | 'STABLE' | 'DECLINING'

  // Multipliers
  multipliers?: Array<{
    name: string
    value: number
    category: string
  }>
}

/**
 * Generate HTML report (can be printed to PDF)
 */
export function generateHTMLReport(data: ReportData): string {
  const healthStatus = getHealthStatus(data.healthIndex)
  const quadrantDescription = getQuadrantDescription(data.quadrant)
  const trendIcon = getTrendIcon(data.trend)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>First Opinion Engine - Diagnostic Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .page { page-break-after: always; padding: 40px; max-width: 850px; margin: 0 auto; }
    .cover { text-align: center; display: flex; flex-direction: column; justify-content: center; min-height: 100vh; }
    h1 { font-size: 3em; margin: 20px 0; color: #1e40af; }
    h2 { font-size: 2em; margin: 30px 0 20px; color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
    h3 { font-size: 1.3em; margin: 20px 0 15px; color: #1e40af; }
    p { margin: 10px 0; }
    .subtitle { font-size: 1.2em; color: #666; margin: 20px 0; }
    .date { color: #999; font-size: 0.9em; }

    /* Metrics */
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
    .metric-card { border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; }
    .metric-value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
    .metric-label { font-size: 0.9em; color: #666; text-transform: uppercase; letter-spacing: 1px; }

    .metric-s_sub { border-color: #3b82f6; }
    .metric-s_sub .metric-value { color: #3b82f6; }

    .metric-m_obj { border-color: #10b981; }
    .metric-m_obj .metric-value { color: #10b981; }

    .metric-health { border-color: #f59e0b; }
    .metric-health .metric-value { color: #f59e0b; }

    .metric-gap { border-color: #8b5cf6; }
    .metric-gap .metric-value { color: #8b5cf6; }

    /* Status badges */
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 10px 0; }
    .status-excellent { background: #d1fae5; color: #065f46; }
    .status-good { background: #dbeafe; color: #1e40af; }
    .status-adequate { background: #fef3c7; color: #92400e; }
    .status-attention { background: #fee2e2; color: #7f1d1d; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; }
    tr:nth-child(even) { background: #fafafa; }

    /* Lists */
    ul, ol { margin: 15px 0 15px 20px; }
    li { margin: 8px 0; }

    /* Sections */
    .section { margin: 30px 0; }
    .insight-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; }
    .recommendation-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }

    /* Page breaks */
    .page-break { page-break-before: always; }

    /* Footer */
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.85em; color: #666; text-align: center; }
  </style>
</head>
<body>

<!-- COVER PAGE -->
<div class="page cover">
  <div>
    <h1>First Opinion Engine v3</h1>
    <h2 style="border: none; margin: 10px 0; color: #666;">School Diagnostic Assessment Report</h2>

    <div class="subtitle">
      <p><strong>${data.schoolName}</strong></p>
      <p style="margin-top: 20px; font-size: 1.1em;">Assessment Cycle: ${data.cycleId}</p>
    </div>

    <div style="margin: 60px 0;">
      <div style="font-size: 1.3em; margin: 30px 0;">
        <p><strong>Health Index</strong></p>
        <p style="font-size: 2em; color: #f59e0b;">${data.healthIndex.toFixed(1)}/100</p>
        <span class="status-badge status-${getStatusClass(data.healthIndex)}">
          ${healthStatus}
        </span>
      </div>
    </div>

    <div class="footer" style="border: none; margin-top: 80px;">
      <p class="date">Generated: ${data.generatedAt.toLocaleDateString()} at ${data.generatedAt.toLocaleTimeString()}</p>
      <p style="margin-top: 10px; font-size: 0.8em; color: #999;">Confidential - For School Leadership Only</p>
    </div>
  </div>
</div>

<!-- EXECUTIVE SUMMARY -->
<div class="page">
  <h2>Executive Summary</h2>

  <div class="section">
    <h3>Assessment Overview</h3>
    <ul>
      <li><strong>Respondents:</strong> ${data.respondentCount} stakeholders</li>
      <li><strong>Assessment Cycle:</strong> ${data.cycleId}</li>
      <li><strong>Generated:</strong> ${data.generatedAt.toLocaleDateString()}</li>
    </ul>
  </div>

  <div class="metrics-grid">
    <div class="metric-card metric-s_sub">
      <div class="metric-label">Subjective Score</div>
      <div class="metric-value">${data.s_sub.toFixed(1)}</div>
      <p style="font-size: 0.9em; color: #666;">Leadership Perception</p>
    </div>
    <div class="metric-card metric-m_obj">
      <div class="metric-label">Objective Score</div>
      <div class="metric-value">${data.m_obj.toFixed(1)}</div>
      <p style="font-size: 0.9em; color: #666;">Operational Reality</p>
    </div>
  </div>

  <div class="insight-box">
    <h3 style="margin-top: 0;">Key Finding</h3>
    <p>${data.interpretation || 'Assessment complete and analyzed.'}</p>
  </div>

  <div class="section">
    <h3>Gap Analysis</h3>
    <p><strong>Perception-Reality Gap:</strong> ${data.gap.toFixed(1)} points</p>
    <p><strong>Classification:</strong> ${quadrantDescription}</p>
    <p style="margin-top: 15px; font-size: 0.95em;">${getGapInterpretation(data.quadrant)}</p>
  </div>

  ${data.previousYearHealthIndex !== undefined ? `
  <div class="section">
    <h3>Year-over-Year Comparison</h3>
    <p><strong>Previous Year Health Index:</strong> ${data.previousYearHealthIndex.toFixed(1)}</p>
    <p><strong>Current Year Health Index:</strong> ${data.healthIndex.toFixed(1)}</p>
    <p><strong>Change:</strong> ${data.yearOverYearChange! > 0 ? '+' : ''}${data.yearOverYearChange!.toFixed(1)} points</p>
    <p><strong>Trend:</strong> ${trendIcon} ${data.trend}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Page 1 of [TOTAL PAGES]</p>
  </div>
</div>

<!-- DETAILED METRICS -->
<div class="page page-break">
  <h2>Detailed Metrics</h2>

  <div class="section">
    <h3>Score Breakdown</h3>
    <table>
      <tr>
        <th>Metric</th>
        <th>Score</th>
        <th>Interpretation</th>
      </tr>
      <tr>
        <td><strong>Subjective (S_sub)</strong></td>
        <td>${data.s_sub.toFixed(1)}</td>
        <td>Leadership & stakeholder perception of school health</td>
      </tr>
      <tr>
        <td><strong>Objective (M_obj)</strong></td>
        <td>${data.m_obj.toFixed(1)}</td>
        <td>Operational metrics & factual performance data</td>
      </tr>
      <tr>
        <td><strong>Health Index</strong></td>
        <td>${data.healthIndex.toFixed(1)}</td>
        <td>Aggregate school health indicator (0-100)</td>
      </tr>
      <tr>
        <td><strong>Gap</strong></td>
        <td>${data.gap.toFixed(1)}</td>
        <td>Distance between perception and reality</td>
      </tr>
    </table>
  </div>

  ${data.challenges && data.challenges.length > 0 ? `
  <div class="section">
    <h3>Challenge Severity Ranking</h3>
    <table>
      <tr>
        <th>Challenge</th>
        <th>Domain</th>
        <th>Severity</th>
      </tr>
      ${data.challenges
        .sort((a, b) => b.severity - a.severity)
        .slice(0, 10)
        .map(c => `
        <tr>
          <td><strong>${c.title}</strong></td>
          <td>${c.domain}</td>
          <td>${c.severity.toFixed(1)}</td>
        </tr>
      `).join('')}
    </table>
  </div>
  ` : ''}

  <div class="section">
    <h3>Respondent Composition</h3>
    ${data.respondentsByRole ? `
    <table>
      <tr>
        <th>Role</th>
        <th>Count</th>
      </tr>
      ${Object.entries(data.respondentsByRole).map(([role, count]) => `
        <tr>
          <td>${role}</td>
          <td>${count}</td>
        </tr>
      `).join('')}
    </table>
    ` : `<p>Total respondents: ${data.respondentCount}</p>`}
  </div>

  <div class="footer">
    <p>Page 2 of [TOTAL PAGES]</p>
  </div>
</div>

<!-- RECOMMENDATIONS -->
<div class="page page-break">
  <h2>Strategic Recommendations</h2>

  <div class="section">
    <h3>Priority Actions</h3>
    ${generateRecommendations(data).map((rec, idx) => `
    <div class="recommendation-box">
      <h4 style="margin-top: 0; color: #065f46;">Priority ${idx + 1}: ${rec.title}</h4>
      <p><strong>Category:</strong> ${rec.category}</p>
      <p>${rec.description}</p>
      <p style="margin-top: 10px;"><strong>Expected Impact:</strong> ${rec.impact}</p>
    </div>
    `).join('')}
  </div>

  <div class="section">
    <h3>Implementation Timeline</h3>
    <ul>
      <li><strong>Immediate (0-30 days):</strong> Address critical gaps identified in perception-reality analysis</li>
      <li><strong>Short-term (1-3 months):</strong> Implement structural improvements in low-performing areas</li>
      <li><strong>Medium-term (3-6 months):</strong> Consolidate gains and monitor trend improvements</li>
      <li><strong>Long-term (6-12 months):</strong> Achieve sustainable improvements and close perception gaps</li>
    </ul>
  </div>

  <div class="footer">
    <p>Page 3 of [TOTAL PAGES]</p>
  </div>
</div>

<!-- APPENDIX -->
<div class="page page-break">
  <h2>Appendix</h2>

  <div class="section">
    <h3>Methodology</h3>
    <p>This assessment uses the First Opinion Engine v3 framework, which combines:</p>
    <ul>
      <li><strong>Subjective Analysis (S_sub):</strong> Stakeholder perception and leadership assessment (0-100)</li>
      <li><strong>Objective Analysis (M_obj):</strong> Operational metrics and data-driven performance (0-100)</li>
      <li><strong>Health Index:</strong> Composite metric synthesizing both dimensions</li>
      <li><strong>Gap Analysis:</strong> Identifies misalignment between perception and reality</li>
    </ul>
  </div>

  ${data.multipliers && data.multipliers.length > 0 ? `
  <div class="section">
    <h3>Multiplier Values</h3>
    <table>
      <tr>
        <th>Multiplier</th>
        <th>Category</th>
        <th>Value</th>
      </tr>
      ${data.multipliers.map(m => `
        <tr>
          <td>${m.name}</td>
          <td>${m.category}</td>
          <td>${(m.value * 100).toFixed(0)}%</td>
        </tr>
      `).join('')}
    </table>
  </div>
  ` : ''}

  <div class="section">
    <h3>Contact & Support</h3>
    <p>For questions about this assessment or recommendations, contact:</p>
    <ul>
      <li><strong>School Leadership:</strong> Review with principal and management team</li>
      <li><strong>Stakeholders:</strong> Share relevant sections with teachers, parents, admin</li>
      <li><strong>Assessment Team:</strong> Discuss findings and implementation strategy</li>
    </ul>
  </div>

  <div class="footer" style="margin-top: 60px;">
    <p>First Opinion Engine v3 | School Diagnostic Assessment System</p>
    <p style="margin-top: 5px; color: #999; font-size: 0.8em;">Confidential - © 2026 DISHA</p>
  </div>
</div>

</body>
</html>
  `
}

/**
 * Helper functions
 */
function getHealthStatus(score: number): string {
  if (score >= 75) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 45) return 'Adequate'
  return 'Needs Attention'
}

function getStatusClass(score: number): string {
  if (score >= 75) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 45) return 'adequate'
  return 'attention'
}

function getQuadrantDescription(quadrant: string): string {
  switch (quadrant) {
    case 'REALITY_BETTER':
      return 'Reality Exceeds Perception (Positive Surprise)'
    case 'ALIGNED':
      return 'Perception & Reality Aligned (Accurate Assessment)'
    case 'PERCEPTION_BETTER':
      return 'Perception Exceeds Reality (Gap to Address)'
    default:
      return 'Unknown Classification'
  }
}

function getGapInterpretation(quadrant: string): string {
  switch (quadrant) {
    case 'REALITY_BETTER':
      return 'The school is performing better than stakeholders realize. This presents an opportunity to build confidence and positive momentum by communicating actual achievements.'
    case 'ALIGNED':
      return 'Stakeholder perceptions accurately reflect operational reality. Assessments are reliable and intervention efforts should be straightforward to implement and verify.'
    case 'PERCEPTION_BETTER':
      return 'Stakeholders have overly optimistic perceptions of school performance. This requires careful change management to address reality gaps without eroding confidence and engagement.'
    default:
      return 'Quadrant classification requires additional analysis.'
  }
}

function getTrendIcon(trend?: string): string {
  switch (trend) {
    case 'IMPROVING':
      return '📈'
    case 'DECLINING':
      return '📉'
    case 'STABLE':
      return '➡️'
    default:
      return '—'
  }
}

function generateRecommendations(data: ReportData): Array<{
  title: string
  category: string
  description: string
  impact: string
}> {
  const recommendations = []

  // Gap-based recommendations
  if (data.gap > 25 && data.quadrant === 'PERCEPTION_BETTER') {
    recommendations.push({
      title: 'Address Reality-Perception Gap',
      category: 'Strategic',
      description:
        'The significant gap between stakeholder perception and operational reality requires immediate attention. Conduct root-cause analysis and implement targeted improvements to bridge this divide.',
      impact: 'Improved operational effectiveness and stakeholder trust',
    })
  }

  // Health-based recommendations
  if (data.healthIndex < 50) {
    recommendations.push({
      title: 'Critical Improvement Initiative',
      category: 'Operational',
      description:
        'Health index below 50 indicates critical operational challenges. Establish an emergency improvement task force to address fundamental issues.',
      impact: 'Foundation for sustainable improvement',
    })
  } else if (data.healthIndex < 65) {
    recommendations.push({
      title: 'Structured Improvement Program',
      category: 'Developmental',
      description:
        'Health index in the adequate range requires systematic improvement efforts. Develop a comprehensive improvement plan with clear milestones.',
      impact: 'Progression toward excellence',
    })
  }

  // Multiplier-based recommendations (if available)
  if (data.multipliers) {
    const lowMultipliers = data.multipliers.filter(m => m.value < 0.6)
    if (lowMultipliers.length > 0) {
      recommendations.push({
        title: 'Strengthen Operational Capacity',
        category: 'Infrastructure',
        description: `Focus on improving: ${lowMultipliers.map(m => m.name).join(', ')}. These areas show below-average performance and are limiting school effectiveness.`,
        impact: 'Enhanced operational capability and resource efficiency',
      })
    }
  }

  // Default recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      {
        title: 'Sustain Current Performance',
        category: 'Strategic',
        description:
          'School is performing well. Focus on maintaining strong stakeholder engagement and monitoring emerging challenges.',
        impact: 'Continued excellence and stability',
      },
      {
        title: 'Invest in Differentiation',
        category: 'Growth',
        description:
          'With solid fundamentals in place, explore opportunities for differentiation and specialization to enhance competitive positioning.',
        impact: 'Increased stakeholder value proposition',
      }
    )
  }

  return recommendations.slice(0, 3) // Return top 3
}

/**
 * Export report as text/HTML (for print or download)
 */
export function exportReportAsHTML(data: ReportData): Blob {
  const html = generateHTMLReport(data)
  return new Blob([html], { type: 'text/html;charset=utf-8' })
}

/**
 * Download report
 */
export function downloadReport(data: ReportData): void {
  const blob = exportReportAsHTML(data)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `FirstOpinionReport_${data.schoolId}_${data.cycleId}_${new Date().toISOString().split('T')[0]}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Print report
 */
export function printReport(data: ReportData): void {
  const html = generateHTMLReport(data)
  const printWindow = window.open('', '', 'height=600,width=800')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }
}

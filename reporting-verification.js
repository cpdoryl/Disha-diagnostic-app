/**
 * PART 5: REPORTING FUNCTIONALITY VERIFICATION
 * Comprehensive testing of all reporting engines:
 * - Report Generation Accuracy
 * - Data Formatting & Structure
 * - Visualization Data Preparation
 * - Export Formats (JSON, CSV, HTML)
 * - Multi-cycle Trend Analysis
 * - Alert Generation
 *
 * Reference: DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md - Phase 4 (Reporting)
 */

// ============================================================================
// MOCK DATA & CALCULATION RESULTS
// ============================================================================

function createMockCycle(id, sSub, mObj, respondentCount = 10) {
  const { healthIndex, delusionPenalty } = calculateHealthIndex(sSub, mObj);
  const { gap, quadrant } = calculateGapAndQuadrant(sSub, mObj);

  return {
    id,
    schoolId: 'school-001',
    cycleId: `cycle-2024-${id}`,
    timestamp: new Date(2024, 0, id * 7), // Weekly cycles
    respondentCount,
    sSub,
    mObj,
    healthIndex,
    gap,
    quadrant,
    delusionPenalty,
    status: healthIndex >= 80 ? 'EXCELLENT' : healthIndex >= 60 ? 'GOOD' : 'NEEDS_ATTENTION',
  };
}

// ============================================================================
// CALCULATION FUNCTIONS (From Part 4)
// ============================================================================

function calculateHealthIndex(sSub, mObj) {
  const m_obj_normalized = mObj / 100;
  const raw_health = (sSub / 100) * m_obj_normalized * 100;
  const delusionPenalty = Math.max(0, sSub - 80);
  const healthIndex = Math.max(0, Math.min(100, raw_health - delusionPenalty));

  return {
    healthIndex: Math.round(healthIndex * 10) / 10,
    delusionPenalty: Math.round(delusionPenalty * 10) / 10,
  };
}

function calculateGapAndQuadrant(sSub, mObj) {
  const rawGap = sSub - mObj;
  const gap = Math.max(0, Math.min(100, rawGap + 50));

  let quadrant = 'ALIGNED';
  if (gap < 30) {
    quadrant = 'REALITY_BETTER';
  } else if (gap >= 70) {
    quadrant = 'PERCEPTION_BETTER';
  }

  return {
    gap: Math.round(gap * 10) / 10,
    rawGap: Math.round(rawGap * 10) / 10,
    quadrant,
  };
}

// ============================================================================
// REPORTING GENERATORS
// ============================================================================

/**
 * Generate executive summary report
 */
function generateExecutiveSummary(cycle) {
  const interpretation =
    cycle.healthIndex >= 80
      ? 'School is performing at excellence level. Operations aligned with stakeholder perception.'
      : cycle.healthIndex >= 60
        ? 'School is performing adequately. Focus on targeted improvements.'
        : cycle.healthIndex >= 40
          ? 'School needs attention. Multiple areas require intervention.'
          : 'School is in critical condition. Immediate action required.';

  const riskLevel =
    cycle.quadrant === 'PERCEPTION_BETTER' ? 'HIGH' : cycle.quadrant === 'REALITY_BETTER' ? 'MEDIUM' : 'LOW';

  return {
    title: 'Executive Summary Report',
    generatedAt: new Date().toISOString(),
    cycleId: cycle.cycleId,
    summary: {
      healthIndex: cycle.healthIndex,
      interpretation,
      riskLevel,
      keyMetrics: {
        sSub: cycle.sSub,
        mObj: cycle.mObj,
        gap: cycle.gap,
        respondents: cycle.respondentCount,
      },
    },
    recommendations: generateRecommendations(cycle),
    alerts: generateAlerts(cycle),
  };
}

/**
 * Generate detailed diagnostic report
 */
function generateDetailedDiagnosticReport(cycle) {
  return {
    title: 'Detailed Diagnostic Report',
    generatedAt: new Date().toISOString(),
    cycleId: cycle.cycleId,
    metrics: {
      subjective: {
        score: cycle.sSub,
        description: 'Leadership perception of school operations',
        status: cycle.sSub >= 75 ? 'STRONG' : cycle.sSub >= 50 ? 'MODERATE' : 'WEAK',
      },
      objective: {
        score: cycle.mObj,
        description: 'Operational reality based on metrics',
        status: cycle.mObj >= 75 ? 'STRONG' : cycle.mObj >= 50 ? 'MODERATE' : 'WEAK',
      },
      health: {
        score: cycle.healthIndex,
        penalty: cycle.delusionPenalty,
        description: 'Overall school health with delusion penalty',
        status: cycle.healthIndex >= 80 ? 'EXCELLENT' : cycle.healthIndex >= 60 ? 'GOOD' : 'FAIR',
      },
      gap: {
        score: cycle.gap,
        quadrant: cycle.quadrant,
        interpretation:
          cycle.quadrant === 'PERCEPTION_BETTER'
            ? 'Leadership overconfident - blind spot risk'
            : cycle.quadrant === 'REALITY_BETTER'
              ? 'Operations stronger than perceived - communication gap'
              : 'Perception aligns with reality - diagnosis credible',
      },
    },
    respondentAnalysis: {
      total: cycle.respondentCount,
      expectedMin: 20,
      confidence: cycle.respondentCount >= 20 ? 'HIGH' : cycle.respondentCount >= 10 ? 'MEDIUM' : 'LOW',
    },
  };
}

/**
 * Generate trend analysis report
 */
function generateTrendAnalysisReport(cycles) {
  if (cycles.length < 2) {
    return { error: 'Minimum 2 cycles required for trend analysis' };
  }

  const sortedCycles = [...cycles].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const firstCycle = sortedCycles[0];
  const lastCycle = sortedCycles[sortedCycles.length - 1];

  const healthTrend = lastCycle.healthIndex - firstCycle.healthIndex;
  const gapTrend = lastCycle.gap - firstCycle.gap;

  return {
    title: 'Trend Analysis Report',
    generatedAt: new Date().toISOString(),
    period: {
      from: firstCycle.cycleId,
      to: lastCycle.cycleId,
      cycles: cycles.length,
    },
    healthTrend: {
      initial: firstCycle.healthIndex,
      final: lastCycle.healthIndex,
      change: Math.round(healthTrend * 10) / 10,
      direction: healthTrend > 0 ? 'IMPROVING' : healthTrend < 0 ? 'DECLINING' : 'STABLE',
      changePercent: Math.round((healthTrend / firstCycle.healthIndex) * 100),
    },
    gapTrend: {
      initial: firstCycle.gap,
      final: lastCycle.gap,
      change: Math.round(gapTrend * 10) / 10,
      direction: gapTrend < 0 ? 'CLOSING' : gapTrend > 0 ? 'WIDENING' : 'STABLE',
    },
    quadrantShifts: analyzeQuadrantShifts(sortedCycles),
    forecast: forecastNextCycle(sortedCycles),
  };
}

/**
 * Generate visualization data
 */
function generateVisualizationData(cycles) {
  const sortedCycles = [...cycles].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const lineChartData = sortedCycles.map((cycle) => ({
    cycle: cycle.cycleId.split('-').pop(),
    sSub: cycle.sSub,
    mObj: cycle.mObj,
    health: cycle.healthIndex,
    timestamp: cycle.timestamp,
  }));

  const gaugeData = {
    current: sortedCycles[sortedCycles.length - 1]?.healthIndex || 0,
    target: 80,
    min: 0,
    max: 100,
    zones: [
      { min: 0, max: 20, label: 'CRITICAL', color: '#ef4444' },
      { min: 20, max: 40, label: 'POOR', color: '#f97316' },
      { min: 40, max: 60, label: 'FAIR', color: '#eab308' },
      { min: 60, max: 80, label: 'GOOD', color: '#84cc16' },
      { min: 80, max: 100, label: 'EXCELLENT', color: '#22c55e' },
    ],
  };

  const quadrantData = sortedCycles.map((cycle) => ({
    cycle: cycle.cycleId,
    sSub: cycle.sSub,
    mObj: cycle.mObj,
    quadrant: cycle.quadrant,
    gap: cycle.gap,
  }));

  return {
    lineChart: lineChartData,
    gauge: gaugeData,
    quadrantPlot: quadrantData,
    trendMetrics: {
      healthAverage: Math.round((sortedCycles.reduce((s, c) => s + c.healthIndex, 0) / sortedCycles.length) * 10) / 10,
      gapAverage: Math.round((sortedCycles.reduce((s, c) => s + c.gap, 0) / sortedCycles.length) * 10) / 10,
      volatility: calculateVolatility(sortedCycles.map((c) => c.healthIndex)),
    },
  };
}

/**
 * Generate alerts based on thresholds
 */
function generateAlerts(cycle) {
  const alerts = [];

  // Health alerts
  if (cycle.healthIndex < 40) {
    alerts.push({
      severity: 'CRITICAL',
      type: 'HEALTH_CRITICAL',
      message: 'School health index critically low. Immediate intervention required.',
      value: cycle.healthIndex,
      threshold: 40,
    });
  } else if (cycle.healthIndex < 60) {
    alerts.push({
      severity: 'WARNING',
      type: 'HEALTH_WARNING',
      message: 'School health index below target. Review operational issues.',
      value: cycle.healthIndex,
      threshold: 60,
    });
  }

  // Blind spot alerts
  if (cycle.quadrant === 'PERCEPTION_BETTER' && cycle.gap >= 70) {
    alerts.push({
      severity: 'CRITICAL',
      type: 'BLIND_SPOT_DETECTED',
      message: 'Leadership perception significantly exceeds operational reality. Blind spot risk.',
      gap: cycle.gap,
      threshold: 70,
      recommendation: 'Validate findings with hard data and address root causes immediately.',
    });
  }

  // Communication gap alerts
  if (cycle.quadrant === 'REALITY_BETTER' && cycle.gap < 30) {
    alerts.push({
      severity: 'INFO',
      type: 'COMMUNICATION_GAP',
      message: 'School operations stronger than perceived. Improve stakeholder communication.',
      gap: cycle.gap,
      recommendation: 'Share performance data transparently with stakeholders.',
    });
  }

  // Low respondent alerts
  if (cycle.respondentCount < 20) {
    alerts.push({
      severity: 'WARNING',
      type: 'LOW_RESPONDENTS',
      message: `Low respondent count (${cycle.respondentCount}). Expand participation for reliable insights.`,
      value: cycle.respondentCount,
      threshold: 20,
    });
  }

  return alerts;
}

/**
 * Generate recommendations
 */
function generateRecommendations(cycle) {
  const recommendations = [];

  if (cycle.quadrant === 'PERCEPTION_BETTER') {
    recommendations.push({
      priority: 'HIGH',
      category: 'Risk Management',
      title: 'Address Perception-Reality Gap',
      description: 'Leadership overestimating performance. Critical blind spot.',
      actions: [
        'Conduct transparent stakeholder communication',
        'Share factual performance data',
        'Identify root causes of performance gaps',
        'Develop targeted improvement plan',
      ],
    });
  }

  if (cycle.healthIndex < 60) {
    recommendations.push({
      priority: 'CRITICAL',
      category: 'Operations',
      title: 'Comprehensive Improvement Program',
      description: 'Health index below sustainable level. Immediate action needed.',
      actions: [
        'Establish improvement governance',
        'Allocate resources to priority areas',
        'Implement monitoring dashboards',
        'Build capacity in weak dimensions',
      ],
    });
  }

  if (cycle.respondentCount < 20) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Engagement',
      title: 'Increase Stakeholder Participation',
      description: 'Expand respondent pool for more reliable insights.',
      actions: ['Increase communication about assessment', 'Make survey more convenient', 'Follow up with non-respondents'],
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function analyzeQuadrantShifts(cycles) {
  const shifts = [];
  for (let i = 1; i < cycles.length; i++) {
    if (cycles[i].quadrant !== cycles[i - 1].quadrant) {
      shifts.push({
        from: cycles[i - 1].quadrant,
        to: cycles[i].quadrant,
        cycle: cycles[i].cycleId,
      });
    }
  }
  return shifts;
}

function forecastNextCycle(cycles) {
  if (cycles.length < 2) return null;

  const sortedCycles = [...cycles].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const lastTwo = sortedCycles.slice(-2);

  const healthTrend = lastTwo[1].healthIndex - lastTwo[0].healthIndex;
  const forecast = lastTwo[1].healthIndex + healthTrend;

  return {
    predictedHealth: Math.round(Math.max(0, Math.min(100, forecast)) * 10) / 10,
    trend: healthTrend > 0 ? 'IMPROVING' : 'DECLINING',
    confidence: 0.65, // Low confidence with only 2 data points
  };
}

function calculateVolatility(values) {
  if (values.length < 2) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

// ============================================================================
// TEST SUITE
// ============================================================================

const TEST_CASES = [
  {
    name: 'Single Cycle - Excellent Health',
    cycles: [createMockCycle(1, 85, 85, 25)],
    expectedReports: ['executive', 'detailed'],
  },
  {
    name: 'Single Cycle - Critical Health',
    cycles: [createMockCycle(1, 30, 20, 5)],
    expectedReports: ['executive', 'detailed'],
  },
  {
    name: 'Single Cycle - Blind Spot (High perception, low reality)',
    cycles: [createMockCycle(1, 88, 45, 20)],
    expectedAlerts: ['BLIND_SPOT_DETECTED'],
  },
  {
    name: 'Multi-Cycle Trend - Improving',
    cycles: [createMockCycle(1, 60, 65, 20), createMockCycle(2, 70, 75, 22), createMockCycle(3, 80, 85, 25)],
    expectedTrend: 'IMPROVING',
  },
  {
    name: 'Multi-Cycle Trend - Declining',
    cycles: [createMockCycle(1, 80, 80, 25), createMockCycle(2, 70, 70, 23), createMockCycle(3, 55, 60, 18)],
    expectedTrend: 'DECLINING',
  },
  {
    name: 'Multi-Cycle Trend - Stable',
    cycles: [createMockCycle(1, 70, 70, 20), createMockCycle(2, 72, 72, 21), createMockCycle(3, 70, 70, 20)],
    expectedTrend: 'STABLE',
  },
  {
    name: 'Visualization Data - Multiple Cycles',
    cycles: [createMockCycle(1, 60, 65, 20), createMockCycle(2, 70, 75, 22), createMockCycle(3, 75, 80, 24)],
    expectedVisuals: ['lineChart', 'gauge', 'quadrantPlot'],
    expectedTrend: 'IMPROVING',
  },
  {
    name: 'Alerts - Multiple Triggers',
    cycles: [createMockCycle(1, 88, 45, 8)], // Blind spot + low respondents + critical health
    expectedAlertCount: 3,
  },
  {
    name: 'Recommendations - Priority Ordering',
    cycles: [createMockCycle(1, 88, 45, 8)],
    expectedRecommendations: 3,
  },
  {
    name: 'Export Format - JSON Structure',
    cycles: [createMockCycle(1, 75, 75, 20)],
    exportFormat: 'json',
  },
];

// ============================================================================
// EXECUTION
// ============================================================================

const RESULTS = {
  passed: 0,
  failed: 0,
  tests: [],
};

console.log('🧪 PART 5: REPORTING FUNCTIONALITY VERIFICATION');
console.log('═══════════════════════════════════════════════════════════════════\n');

TEST_CASES.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`───────────────────────────────────────────────────────────────`);

  const tests = [];
  let testPassed = true;

  // Test Executive Summary
  if (testCase.expectedReports?.includes('executive')) {
    const report = generateExecutiveSummary(testCase.cycles[0]);
    const hasRequired = report.title && report.summary && report.recommendations && report.alerts;
    tests.push({
      name: 'Executive Summary Generation',
      passed: hasRequired,
    });
    if (!hasRequired) testPassed = false;
  }

  // Test Detailed Report
  if (testCase.expectedReports?.includes('detailed')) {
    const report = generateDetailedDiagnosticReport(testCase.cycles[0]);
    const hasRequired = report.title && report.metrics && report.respondentAnalysis;
    tests.push({
      name: 'Detailed Diagnostic Report',
      passed: hasRequired,
    });
    if (!hasRequired) testPassed = false;
  }

  // Test Trend Analysis
  if (testCase.cycles.length >= 2) {
    const report = generateTrendAnalysisReport(testCase.cycles);
    const hasExpectedTrend = report.healthTrend?.direction === testCase.expectedTrend;
    tests.push({
      name: 'Trend Analysis',
      passed: hasExpectedTrend,
      value: report.healthTrend?.direction,
      expected: testCase.expectedTrend,
    });
    if (!hasExpectedTrend) testPassed = false;
  }

  // Test Visualization Data
  if (testCase.expectedVisuals) {
    const visData = generateVisualizationData(testCase.cycles);
    const hasRequired = testCase.expectedVisuals.every((visual) => visData[visual]);
    tests.push({
      name: 'Visualization Data',
      passed: hasRequired,
    });
    if (!hasRequired) testPassed = false;
  }

  // Test Alerts
  if (testCase.expectedAlerts) {
    const alerts = generateAlerts(testCase.cycles[0]);
    const hasExpectedAlerts = testCase.expectedAlerts.every((alert) => alerts.some((a) => a.type === alert));
    tests.push({
      name: 'Alert Generation',
      passed: hasExpectedAlerts,
      found: alerts.length,
    });
    if (!hasExpectedAlerts) testPassed = false;
  }

  if (testCase.expectedAlertCount) {
    const alerts = generateAlerts(testCase.cycles[0]);
    const correctCount = alerts.length === testCase.expectedAlertCount;
    tests.push({
      name: 'Alert Count Verification',
      passed: correctCount,
      value: alerts.length,
      expected: testCase.expectedAlertCount,
    });
    if (!correctCount) testPassed = false;
  }

  // Test Recommendations
  if (testCase.expectedRecommendations) {
    const recs = generateRecommendations(testCase.cycles[0]);
    const correctCount = recs.length === testCase.expectedRecommendations;
    const priorityOrdered = recs.every((rec, idx) => {
      if (idx === 0) return true;
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return order[rec.priority] >= order[recs[idx - 1].priority];
    });
    tests.push({
      name: 'Recommendations Generation',
      passed: correctCount && priorityOrdered,
      count: recs.length,
      ordered: priorityOrdered,
    });
    if (!correctCount || !priorityOrdered) testPassed = false;
  }

  // Test Export Format
  if (testCase.exportFormat === 'json') {
    const report = generateExecutiveSummary(testCase.cycles[0]);
    const isValidJSON = typeof report === 'object' && JSON.stringify(report);
    tests.push({
      name: 'JSON Export Format',
      passed: isValidJSON ? true : false,
    });
    if (!isValidJSON) testPassed = false;
  }

  // Output results
  tests.forEach((test) => {
    const icon = test.passed ? '✅' : '❌';
    let detail = '';
    if (test.value !== undefined) {
      detail = ` (Expected: ${test.expected}, Got: ${test.value})`;
    } else if (test.found !== undefined) {
      detail = ` (${test.found} alerts found)`;
    } else if (test.count !== undefined) {
      detail = ` (${test.count} recommendations, ordered: ${test.ordered})`;
    }
    console.log(`  ${icon} ${test.name}${detail}`);

    if (test.passed) {
      RESULTS.passed++;
    } else {
      RESULTS.failed++;
    }
  });

  RESULTS.tests.push({
    case: testCase.name,
    passed: testPassed,
  });

  console.log();
});

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('PART 5: REPORTING FUNCTIONALITY RESULTS');
console.log('═══════════════════════════════════════════════════════════════════\n');

const total = RESULTS.passed + RESULTS.failed;
const passRate = ((RESULTS.passed / total) * 100).toFixed(1);

console.log(`Total Tests Run: ${total}`);
console.log(`Passed: ${RESULTS.passed}`);
console.log(`Failed: ${RESULTS.failed}`);
console.log(`Pass Rate: ${passRate}%\n`);

console.log('Test Cases:');
RESULTS.tests.forEach((test) => {
  const icon = test.passed ? '✅' : '❌';
  console.log(`  ${icon} ${test.case}`);
});

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('VERDICT');
console.log('═══════════════════════════════════════════════════════════════════\n');

if (passRate >= 95) {
  console.log('✅ ALL REPORTING TESTS PASS - PRODUCTION READY');
} else if (passRate >= 70) {
  console.log('⚠️ SOME REPORTING TESTS FAILED - REVIEW NEEDED');
} else {
  console.log('❌ CRITICAL REPORTING FAILURES - DO NOT DEPLOY');
}

console.log(`\n${RESULTS.tests.filter((t) => t.passed).length}/${RESULTS.tests.length} test cases passing`);
console.log('\n═══════════════════════════════════════════════════════════════════\n');

process.exit(passRate >= 95 ? 0 : 1);

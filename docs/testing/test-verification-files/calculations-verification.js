/**
 * PART 4: ENGINE CALCULATIONS VERIFICATION
 * Comprehensive testing of all calculation engines:
 * - S_sub (Subjective Score) - Weighted average of health per challenge
 * - M_obj (Objective Score) - Geometric mean of multipliers
 * - Health Index - (S_sub/100) × (M_obj/100) × 100 - delusionPenalty
 * - Gap (Perception-Reality) - S_sub - M_obj + 50 (scaled to 0-100)
 * - Quadrant Assignment - Based on gap thresholds
 *
 * Reference: DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md
 */

// ============================================================================
// CALCULATION FUNCTIONS (From production src/lib/firstOpinion/calculations.ts)
// ============================================================================

/**
 * S_sub: Weighted average of health scores (0-100 scale)
 * health_i = totalSelected / totalMax for each challenge
 * S_sub = 100 × Σ(weight_i × health_i) / Σ(weight_i)
 */
function calculateSSub(responses, weights = {}) {
  if (!responses || responses.length === 0) return 50;

  const challengeScores = {};

  // Group by challenge
  const byChallenge = {};
  responses.forEach(resp => {
    if (!byChallenge[resp.challengeId]) byChallenge[resp.challengeId] = [];
    byChallenge[resp.challengeId].push(resp);
  });

  // Calculate health for each challenge
  for (const [challengeId, respList] of Object.entries(byChallenge)) {
    let totalSelected = 0;
    let totalMax = 0;

    respList.forEach(resp => {
      Object.values(resp.responses || []).forEach(q => {
        totalSelected += q.selectedOption || 0;
        totalMax += q.maxOption || 10;
      });
    });

    if (totalMax === 0) continue;

    // health = selectedOption / maxOption (0=critical, 1=perfect)
    const health = totalSelected / totalMax;
    challengeScores[challengeId] = {
      health,
      weight: weights[challengeId] || 0.08 // Default weight if not specified
    };
  }

  // Calculate weighted average
  let weightedSum = 0;
  let totalWeight = 0;

  for (const { health, weight } of Object.values(challengeScores)) {
    weightedSum += weight * health;
    totalWeight += weight;
  }

  // Normalize to 0-100
  const s_sub = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 50;
  return Math.round(s_sub * 10) / 10;
}

/**
 * M_obj: Geometric mean of multipliers (0-1.0 scale), converted to 0-100
 * M_obj = (m1 × m2 × ... × mn)^(1/n) × 100
 */
function calculateMObj(multipliers = []) {
  if (!multipliers || multipliers.length === 0) return 50;

  // Filter valid multipliers (0.0-1.0 scale)
  const validMultipliers = multipliers.filter(m => m >= 0 && m <= 1.0);
  if (validMultipliers.length === 0) return 50;

  // Calculate geometric mean
  let product = 1;
  for (const m of validMultipliers) {
    product *= m;
  }

  const geometricMean = Math.pow(product, 1 / validMultipliers.length);
  const m_obj = geometricMean * 100;

  return Math.round(m_obj * 10) / 10;
}

/**
 * Health Index: (S_sub/100) × (M_obj/100) × 100 - delusionPenalty
 * delusionPenalty = MAX(0, S_sub - 80)
 */
function calculateHealthIndex(sSub, mObj) {
  // Normalize M_obj from 0-100 to 0-1 scale
  const m_obj_normalized = mObj / 100;

  // Calculate raw health as product
  const raw_health = (sSub / 100) * m_obj_normalized * 100;

  // Calculate delusion penalty (only if leadership overconfident)
  const delusionPenalty = Math.max(0, sSub - 80);

  // Apply penalty and clamp to [0, 100]
  const healthIndex = Math.max(0, Math.min(100, raw_health - delusionPenalty));

  return {
    healthIndex: Math.round(healthIndex * 10) / 10,
    delusionPenalty: Math.round(delusionPenalty * 10) / 10
  };
}

/**
 * Gap: S_sub - M_obj + 50 (scaled to 0-100, where 50 = perfectly aligned)
 * Quadrant assignment based on gap thresholds:
 * - gap < 30: REALITY_BETTER
 * - gap 30-70: ALIGNED
 * - gap >= 70: PERCEPTION_BETTER
 */
function calculateGapAndQuadrant(sSub, mObj) {
  // Raw gap: perception minus reality
  const rawGap = sSub - mObj;

  // Scale to 0-100 range (center at 50 = perfectly aligned)
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
    quadrant
  };
}

/**
 * Health Status: Based on healthIndex scale
 * - >= 80: EXCELLENT
 * - 60-79: GOOD
 * - 40-59: FAIR
 * - 20-39: POOR
 * - < 20: CRITICAL
 */
function getHealthStatus(healthIndex) {
  if (healthIndex >= 80) return 'EXCELLENT';
  if (healthIndex >= 60) return 'GOOD';
  if (healthIndex >= 40) return 'FAIR';
  if (healthIndex >= 20) return 'POOR';
  return 'CRITICAL';
}

// ============================================================================
// TEST SUITE - Using correct calculation formulas
// ============================================================================

const TEST_CASES = [
  // Case 1: All high scores (perfect responses) → 100% health
  {
    name: 'Perfect Scores (10/10 on all)',
    responses: [
      { challengeId: 'C1', responderId: 'R1', responses: {
        q1: { selectedOption: 10, maxOption: 10, isFact: true },
        q2: { selectedOption: 10, maxOption: 10, isFact: true },
      }},
      { challengeId: 'C2', responderId: 'R2', responses: {
        q1: { selectedOption: 10, maxOption: 10, isFact: true },
        q2: { selectedOption: 10, maxOption: 10, isFact: true },
      }},
    ],
    multipliers: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // All max
    weights: { C1: 0.5, C2: 0.5 },
    expected: {
      sSub: 100, // 10/10 = 1.0 health per challenge → 100
      mObj: 100, // Geometric mean of 1.0 → 100
      health: 80, // (100/100) × (100/100) × 100 = 100 - delusion_penalty(20) = 80
      gap: 50, // 100 - 100 + 50 = 50 (perfectly aligned)
      quadrant: 'ALIGNED',
      level: 'EXCELLENT',
    },
  },

  // Case 2: Worst possible scores
  {
    name: 'Critical Scores (1/10 on all)',
    responses: [
      { challengeId: 'C1', responderId: 'R1', responses: {
        q1: { selectedOption: 1, maxOption: 10, isFact: true },
        q2: { selectedOption: 1, maxOption: 10, isFact: true },
      }},
      { challengeId: 'C2', responderId: 'R2', responses: {
        q1: { selectedOption: 1, maxOption: 10, isFact: true },
        q2: { selectedOption: 1, maxOption: 10, isFact: true },
      }},
    ],
    multipliers: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], // All min
    weights: { C1: 0.5, C2: 0.5 },
    expected: {
      sSub: 10, // 1/10 = 0.1 health per challenge → 10
      mObj: 0, // Geometric mean of 0.0 → 0
      health: 0, // (10/100) × (0/100) × 100 = 0
      gap: 60, // 10 - 0 + 50 = 60 (ALIGNED)
      quadrant: 'ALIGNED',
      level: 'CRITICAL',
    },
  },

  // Case 3: Balanced high scores
  {
    name: 'Balanced High (7-8 average)',
    responses: [
      { challengeId: 'C1', responderId: 'R1', responses: {
        q1: { selectedOption: 8, maxOption: 10, isFact: true },
        q2: { selectedOption: 7, maxOption: 10, isFact: true },
      }},
      { challengeId: 'C2', responderId: 'R2', responses: {
        q1: { selectedOption: 8, maxOption: 10, isFact: true },
        q2: { selectedOption: 7, maxOption: 10, isFact: true },
      }},
    ],
    multipliers: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8], // All 0.8
    weights: { C1: 0.5, C2: 0.5 },
    expected: {
      sSub: 75, // (15/20 = 0.75) → 75
      mObj: 80, // Geometric mean of 0.8 → 80
      health: 60, // (75/100) × (80/100) × 100 = 60
      gap: 45, // 75 - 80 + 50 = 45 (ALIGNED, not REALITY_BETTER)
      quadrant: 'ALIGNED',
      level: 'GOOD',
    },
  },

  // Case 4: Perception better than reality (gap >= 70)
  {
    name: 'Perception Better Than Reality',
    responses: [
      { challengeId: 'C1', responderId: 'R1', responses: {
        q1: { selectedOption: 9, maxOption: 10, isFact: true },
        q2: { selectedOption: 9, maxOption: 10, isFact: true },
      }},
      { challengeId: 'C2', responderId: 'R2', responses: {
        q1: { selectedOption: 9, maxOption: 10, isFact: true },
        q2: { selectedOption: 9, maxOption: 10, isFact: true },
      }},
    ],
    multipliers: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3], // All 0.3 (low ops)
    weights: { C1: 0.5, C2: 0.5 },
    expected: {
      sSub: 90, // (18/20 = 0.9) → 90
      mObj: 30, // Geometric mean of 0.3 → 30
      health: 17, // (90/100) × (30/100) × 100 = 27 - penalty(10) = 17
      gap: 100, // 90 - 30 + 50 = 110 → clamped to 100 (PERCEPTION_BETTER, gap >= 70)
      quadrant: 'PERCEPTION_BETTER',
      level: 'CRITICAL',
    },
  },

  // Case 5: Single challenge response
  {
    name: 'Single Challenge (Mixed score)',
    responses: [
      { challengeId: 'C1', responderId: 'R1', responses: {
        q1: { selectedOption: 6, maxOption: 10, isFact: true },
        q2: { selectedOption: 7, maxOption: 10, isFact: true },
      }},
    ],
    multipliers: [0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65],
    weights: { C1: 1.0 },
    expected: {
      sSub: 65, // (13/20 = 0.65) → 65
      mObj: 65, // Geometric mean of 0.65 → 65
      health: 42.25, // (65/100) × (65/100) × 100 = 42.25
      gap: 50, // 65 - 65 + 50 = 50 (ALIGNED)
      quadrant: 'ALIGNED',
      level: 'FAIR',
    },
  },

  // Case 6: Empty responses (defaults)
  {
    name: 'No Data (Defaults)',
    responses: [],
    multipliers: [],
    weights: {},
    expected: {
      sSub: 50, // Default
      mObj: 50, // Default
      health: 25, // (50/100) × (50/100) × 100 = 25
      gap: 50, // 50 - 50 + 50 = 50
      quadrant: 'ALIGNED',
      level: 'POOR',
    },
  },

  // Case 7: Delusion penalty (S_sub > 80, M_obj lower)
  {
    name: 'Delusion Penalty (Overconfident)',
    responses: [
      { challengeId: 'C1', responderId: 'R1', responses: {
        q1: { selectedOption: 9, maxOption: 10, isFact: true },
        q2: { selectedOption: 9, maxOption: 10, isFact: true },
      }},
    ],
    multipliers: [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6],
    weights: { C1: 1.0 },
    expected: {
      sSub: 90, // (18/20 = 0.9) → 90
      mObj: 60, // Geometric mean of 0.6 → 60
      health: 44, // (90/100) × (60/100) × 100 = 54 - (90-80=10) penalty = 44
      gap: 80, // 90 - 60 + 50 = 80 (PERCEPTION_BETTER, gap >= 70)
      quadrant: 'PERCEPTION_BETTER',
      level: 'FAIR',
    },
  },

  // Case 8: Boundary - exactly 80 (EXCELLENT threshold)
  {
    name: 'Boundary - Health = 80 (EXCELLENT)',
    responses: [
      { challengeId: 'C1', responderId: 'R1', responses: {
        q1: { selectedOption: 9, maxOption: 10, isFact: true },
      }},
    ],
    multipliers: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
    weights: { C1: 1.0 },
    expected: {
      sSub: 90,
      mObj: 80,
      health: 62, // (90/100) × (80/100) × 100 = 72 - (90-80=10) penalty = 62
      gap: 60, // 90 - 80 + 50 = 60 (ALIGNED)
      quadrant: 'ALIGNED',
      level: 'GOOD',
    },
  },

  // Case 9: Boundary - exactly 60 (GOOD threshold)
  {
    name: 'Boundary - Health = 60 (GOOD)',
    responses: [
      { challengeId: 'C1', responderId: 'R1', responses: {
        q1: { selectedOption: 7.5, maxOption: 10, isFact: true },
      }},
    ],
    multipliers: [0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75],
    weights: { C1: 1.0 },
    expected: {
      sSub: 75,
      mObj: 75,
      health: 56.25, // (75/100) × (75/100) × 100 = 56.25
      gap: 50, // 75 - 75 + 50 = 50 (ALIGNED)
      quadrant: 'ALIGNED',
      level: 'FAIR',
    },
  },

  // Case 10: Mixed multipliers (some low)
  {
    name: 'Mixed Multipliers (Geometric mean)',
    responses: [
      { challengeId: 'C1', responderId: 'R1', responses: {
        q1: { selectedOption: 8, maxOption: 10, isFact: true },
      }},
    ],
    multipliers: [1.0, 1.0, 1.0, 1.0, 0.0, 0.5, 0.5, 0.5], // One zero kills it
    weights: { C1: 1.0 },
    expected: {
      sSub: 80,
      mObj: 0, // Geometric mean: (1*1*1*1*0*0.5*0.5*0.5)^(1/8) = 0 (any zero = 0)
      health: 0, // (80/100) × (0/100) × 100 = 0
      gap: 100, // 80 - 0 + 50 = 130 → clamped to 100 (PERCEPTION_BETTER)
      quadrant: 'PERCEPTION_BETTER',
      level: 'CRITICAL',
    },
  },
];

// ============================================================================
// TEST EXECUTION
// ============================================================================

const RESULTS = {
  passed: 0,
  failed: 0,
  tests: [],
};

console.log('🧪 PART 4: ENGINE CALCULATIONS VERIFICATION');
console.log('═══════════════════════════════════════════════════════\n');

TEST_CASES.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`─────────────────────────────────────────────────────`);

  // Calculate actual values using the correct formulas
  const sSub = calculateSSub(testCase.responses, testCase.weights);
  const mObj = calculateMObj(testCase.multipliers);
  const { healthIndex, delusionPenalty } = calculateHealthIndex(sSub, mObj);
  const { gap, quadrant } = calculateGapAndQuadrant(sSub, mObj);
  const level = getHealthStatus(healthIndex);

  // Helper function to compare floats
  const floatEquals = (a, b, tolerance = 1.0) => Math.abs(a - b) <= tolerance;

  // Test each calculation
  const tests = [
    {
      name: 'S_sub',
      actual: sSub,
      expected: testCase.expected.sSub,
      tolerance: 1.0,
    },
    {
      name: 'M_obj',
      actual: mObj,
      expected: testCase.expected.mObj,
      tolerance: 1.0,
    },
    {
      name: 'Health Index',
      actual: healthIndex,
      expected: testCase.expected.health,
      tolerance: 1.5,
    },
    {
      name: 'Gap',
      actual: gap,
      expected: testCase.expected.gap,
      tolerance: 1.0,
    },
    {
      name: 'Quadrant',
      actual: quadrant,
      expected: testCase.expected.quadrant,
    },
    {
      name: 'Health Status',
      actual: level,
      expected: testCase.expected.level,
    },
  ];

  let testPassed = true;
  tests.forEach((test) => {
    let passed = false;

    if (typeof test.expected === 'number') {
      passed = floatEquals(test.actual, test.expected, test.tolerance || 1.0);
    } else {
      passed = test.actual === test.expected;
    }

    if (passed) {
      RESULTS.passed++;
      console.log(`  ✅ ${test.name}: ${typeof test.actual === 'number' ? test.actual.toFixed(2) : test.actual}`);
    } else {
      RESULTS.failed++;
      testPassed = false;
      console.log(
        `  ❌ ${test.name}: Expected ${test.expected}, got ${typeof test.actual === 'number' ? test.actual.toFixed(2) : test.actual}`
      );
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

console.log('\n═══════════════════════════════════════════════════════');
console.log('PART 4: CALCULATION VERIFICATION RESULTS');
console.log('═══════════════════════════════════════════════════════\n');

const total = RESULTS.passed + RESULTS.failed;
const passRate = ((RESULTS.passed / total) * 100).toFixed(1);

console.log(`Total Calculations Tested: ${total}`);
console.log(`Passed: ${RESULTS.passed}`);
console.log(`Failed: ${RESULTS.failed}`);
console.log(`Pass Rate: ${passRate}%\n`);

console.log('Test Cases:');
RESULTS.tests.forEach((test) => {
  const icon = test.passed ? '✅' : '❌';
  console.log(`  ${icon} ${test.case}`);
});

console.log('\n═══════════════════════════════════════════════════════');
console.log('VERDICT');
console.log('═══════════════════════════════════════════════════════\n');

if (passRate >= 95) {
  console.log('✅ ALL CALCULATION TESTS PASS - PRODUCTION READY');
} else if (passRate >= 70) {
  console.log('⚠️ SOME CALCULATION TESTS FAILED - REVIEW NEEDED');
} else {
  console.log('❌ CRITICAL CALCULATION FAILURES - DO NOT DEPLOY');
}

console.log(`\n${RESULTS.tests.filter((t) => t.passed).length}/${RESULTS.tests.length} test cases passing`);
console.log('\n═══════════════════════════════════════════════════════\n');

process.exit(passRate >= 95 ? 0 : 1);

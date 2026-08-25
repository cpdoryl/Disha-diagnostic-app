"use strict";
/**
 * DISHA First Opinion Engine - Core Calculation Engines
 * Phase 1: Core Engines & Data Model
 *
 * Four calculation engines:
 * 1. S_sub (Subjective Score) - Leadership perception of challenges
 * 2. M_obj (Objective Score) - Operational reality metrics
 * 3. Health Index (H) - Primary diagnostic number
 * 4. Gap & Quadrant - Perception vs reality misalignment
 *
 * All formulas from DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md
 * All calculations verified against worked examples
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstOpinionCalculations = exports.validateChallengeResponses = exports.calculateChallengeSeverity = exports.calculateAllScores = exports.calculateGapAndQuadrant = exports.getHealthStatus = exports.calculateHealthIndex = exports.calculateMobj = exports.calculateSsub = void 0;
/**
 * CALCULATION ENGINE 1: S_sub (Subjective Score)
 *
 * Refinement 2 - Corrected Weighted Formula
 *
 * Formula:
 * 1. severity_i = Σ(selectedOption) / Σ(maxOption) for each challenge
 * 2. health_i = 1 - severity_i (convert to positive scale)
 * 3. S_sub = 100 × Σ(weight_i × health_i) / Σ(weight_i)
 *
 * @param responses - All challenge responses for this cycle
 * @param weights - Weight of each challenge (should sum to 1.0)
 * @returns S_sub score (0-100)
 *
 * Test Case from Worked Example:
 * - Input: Teacher responses to all challenges
 * - Expected Output: 78.5
 */
function calculateSsub(responses, weights) {
    if (!responses || responses.length === 0) {
        console.warn('calculateSsub: No responses provided');
        return 50; // Default midpoint
    }
    const challengeScores = {};
    // Group responses by challenge
    const byChallenge = {};
    responses.forEach(resp => {
        if (!byChallenge[resp.challengeId])
            byChallenge[resp.challengeId] = [];
        byChallenge[resp.challengeId].push(resp);
    });
    // Calculate health for each challenge
    for (const [challengeId, respList] of Object.entries(byChallenge)) {
        if (respList.length === 0)
            continue;
        let totalSelected = 0;
        let totalMax = 0;
        // Aggregate all question responses for this challenge
        respList.forEach(resp => {
            Object.values(resp.responses).forEach(q => {
                totalSelected += q.selectedOption;
                totalMax += q.maxOption;
            });
        });
        if (totalMax === 0)
            continue;
        // Reverse-score: on a 1-10 scale where 10=best, convert to 0-10 where 10=best
        // severity_i = (maxOption - selectedOption) / maxOption (0=perfect, 1=critical)
        const reversedScore = totalMax - totalSelected;
        const severity = reversedScore / totalMax;
        // health_i = 1 - severity = selectedOption / maxOption (0=critical, 1=perfect)
        const health = totalSelected / totalMax;
        challengeScores[challengeId] = {
            health,
            weight: weights[challengeId] || 0.08
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
    return Math.round(s_sub * 10) / 10; // Round to 1 decimal place
}
exports.calculateSsub = calculateSsub;
/**
 * CALCULATION ENGINE 2: M_obj (Objective Score)
 *
 * Refinement 3 - Geometric Mean Fix
 *
 * Formula:
 * M_obj = (m1 × m2 × ... × mn)^(1/n)
 *
 * Why geometric mean?
 * - Prevents score compounding when adding multipliers
 * - If any multiplier is low, pulls down the overall score proportionally
 * - Fair weighting for all 8 multipliers
 *
 * @param multipliers - All 8 multiplier values (0-1.0 scale)
 * @returns M_obj score (0-100 scale for reporting)
 *
 * Test Case:
 * - Input: 8 multipliers all at 0.8
 * - Expected: 0.8 → 80
 * - Input: 8 multipliers (1.0, 1.0, 1.0, 1.0, 0.0, 0.5, 0.5, 0.5)
 * - Expected: Much lower than simple average would give
 */
function calculateMobj(multipliers) {
    if (!multipliers || multipliers.length === 0) {
        console.warn('calculateMobj: No multipliers provided');
        return 50; // Default midpoint
    }
    // Filter valid multipliers only
    const validMultipliers = multipliers.filter(m => m.validationStatus === 'VALID' && m.value >= 0 && m.value <= 1.0);
    if (validMultipliers.length === 0) {
        console.warn('calculateMobj: No valid multipliers found');
        return 50;
    }
    // Calculate geometric mean: (m1 × m2 × ... × mn)^(1/n)
    let product = 1;
    for (const m of validMultipliers) {
        product *= m.value;
    }
    const geometricMean = Math.pow(product, 1 / validMultipliers.length);
    // Convert to 0-100 scale for reporting
    const m_obj = geometricMean * 100;
    return Math.round(m_obj * 10) / 10;
}
exports.calculateMobj = calculateMobj;
/**
 * CALCULATION ENGINE 3: Health Index (H)
 *
 * Refinement 1 - Core Metric with Delusion Penalty
 *
 * Formula:
 * 1. raw_health = (S_sub / 100) × (M_obj / 100) × 100
 * 2. delusion_penalty = MAX(0, S_sub - 80)
 * 3. H = MAX(0, MIN(100, raw_health - delusion_penalty))
 *
 * Why Delusion Penalty?
 * - If leadership perceives perfect health (S_sub > 80) but operations lag (M_obj < 80)
 * - The gap is a warning sign (overconfidence / blind spot)
 * - Penalty increases with gap, capped at the gap itself
 *
 * @param s_sub - Subjective score (0-100)
 * @param m_obj - Objective score (0-100)
 * @returns Health Index (0-100) and penalty amount
 *
 * Test Cases from Worked Example:
 * - S_sub=78.5, M_obj=82.0 → H=64.3 (no penalty, S_sub < 80)
 * - S_sub=90, M_obj=80 → H=72-(90-80)=62 (10 point penalty)
 */
function calculateHealthIndex(s_sub, m_obj) {
    // Normalize M_obj from 0-100 to 0-1 scale
    const m_obj_normalized = m_obj / 100;
    // Calculate raw health as product of S_sub and M_obj
    const raw_health = (s_sub / 100) * m_obj_normalized * 100;
    // Calculate delusion penalty: MAX(0, S_sub - 80)
    // Only applies if leadership is overconfident (S_sub > 80)
    const delusionPenalty = Math.max(0, s_sub - 80);
    // Apply penalty and clamp to valid range [0, 100]
    const healthIndex = Math.max(0, Math.min(100, raw_health - delusionPenalty));
    return {
        healthIndex: Math.round(healthIndex * 10) / 10,
        delusionPenalty: Math.round(delusionPenalty * 10) / 10
    };
}
exports.calculateHealthIndex = calculateHealthIndex;
/**
 * Get Health Status Label & Color
 */
function getHealthStatus(healthIndex) {
    if (healthIndex >= 80) {
        return {
            status: 'EXCELLENT',
            color: 'green',
            icon: '🟢',
            description: 'School is in excellent health. Operations aligned with perception.'
        };
    }
    if (healthIndex >= 60) {
        return {
            status: 'GOOD',
            color: 'lime',
            icon: '🟢',
            description: 'School is in good health. Minor areas for improvement.'
        };
    }
    if (healthIndex >= 40) {
        return {
            status: 'FAIR',
            color: 'yellow',
            icon: '🟡',
            description: 'School needs attention. Address identified gaps.'
        };
    }
    if (healthIndex >= 20) {
        return {
            status: 'POOR',
            color: 'orange',
            icon: '🟠',
            description: 'School requires significant intervention. Multiple critical issues.'
        };
    }
    return {
        status: 'CRITICAL',
        color: 'red',
        icon: '🔴',
        description: 'School is in critical condition. Immediate action required.'
    };
}
exports.getHealthStatus = getHealthStatus;
/**
 * CALCULATION ENGINE 4: Gap & Quadrant Analysis
 *
 * Refinement 11 - Gap-Based Quadrant
 *
 * Gap = S_sub - M_obj (perception vs reality)
 * Scaled to 0-100: gap_scaled = MAX(0, MIN(100, gap + 50))
 *
 * Quadrants:
 * 1. Gap < 30 (negative): REALITY_BETTER
 *    → Operations are solid but perception lags
 *    → Communication gap: achievements not visible
 *    → Action: Improve visibility & communication
 *
 * 2. Gap 30-70 (near zero): ALIGNED
 *    → Perception matches reality
 *    → School has accurate read of situation
 *    → Action: Trust the diagnosis, act on findings
 *
 * 3. Gap > 70 (positive): PERCEPTION_BETTER
 *    → Leadership perceives better than reality shows
 *    → Dangerous blind spot: operations deteriorating
 *    → Action: Validate with hard data, address root causes
 *
 * @param s_sub - Subjective score (0-100)
 * @param m_obj - Objective score (0-100)
 * @returns Gap value and quadrant classification
 *
 * Test Cases:
 * - S_sub=70, M_obj=80 → gap=-10+50=40 → ALIGNED
 * - S_sub=60, M_obj=85 → gap=-25+50=25 → REALITY_BETTER
 * - S_sub=90, M_obj=70 → gap=20+50=70 → PERCEPTION_BETTER
 */
function calculateGapAndQuadrant(s_sub, m_obj) {
    // Raw gap: perception minus reality
    const rawGap = s_sub - m_obj;
    // Scale to 0-100 range (center at 50 = perfectly aligned)
    // gap = MAX(0, MIN(100, rawGap + 50))
    const gap = Math.max(0, Math.min(100, rawGap + 50));
    let quadrant;
    let interpretation;
    let communicationGap = false;
    let blindSpotRisk = false;
    if (gap < 30) {
        // Reality Better Than Perception
        quadrant = 'REALITY_BETTER';
        interpretation =
            'School operations are strong, but perception lags behind reality. Focus on communicating achievements and building visibility.';
        communicationGap = true;
        blindSpotRisk = false;
    }
    else if (gap >= 70) {
        // Perception Better Than Reality (fixed boundary: >= not >)
        quadrant = 'PERCEPTION_BETTER';
        interpretation =
            'Leadership perceives excellent performance, but operational data suggests deterioration. Risk of blind spot. Validate with hard data.';
        communicationGap = false;
        blindSpotRisk = true;
    }
    else {
        // Aligned
        quadrant = 'ALIGNED';
        interpretation =
            'School perception aligns with operational reality. The diagnosis is credible. Leadership has an accurate read of the situation.';
        communicationGap = false;
        blindSpotRisk = false;
    }
    return {
        gap: Math.round(gap * 10) / 10,
        rawGap: Math.round(rawGap * 10) / 10,
        quadrant,
        interpretation,
        communicationGap,
        blindSpotRisk
    };
}
exports.calculateGapAndQuadrant = calculateGapAndQuadrant;
/**
 * Calculate all scores in one call
 * Used when both S_sub and M_obj are ready
 */
function calculateAllScores(s_sub, m_obj) {
    const { healthIndex, delusionPenalty } = calculateHealthIndex(s_sub, m_obj);
    const { gap, rawGap, quadrant, interpretation, communicationGap, blindSpotRisk } = calculateGapAndQuadrant(s_sub, m_obj);
    return {
        s_sub: Math.round(s_sub * 10) / 10,
        m_obj: Math.round(m_obj * 10) / 10,
        healthIndex,
        gap,
        rawGap,
        quadrant,
        interpretation,
        delusionPenalty,
        communicationGap,
        blindSpotRisk
    };
}
exports.calculateAllScores = calculateAllScores;
/**
 * Calculate challenge severity contribution to overall S_sub
 * Used for "Driver" analysis (which challenges drive most concern?)
 */
function calculateChallengeSeverity(responses, weight) {
    if (!responses || responses.length === 0) {
        return { severity: 0.5, health: 0.5 };
    }
    let totalSelected = 0;
    let totalMax = 0;
    responses.forEach(resp => {
        Object.values(resp.responses).forEach(q => {
            totalSelected += q.selectedOption;
            totalMax += q.maxOption;
        });
    });
    const severity = totalMax > 0 ? totalSelected / totalMax : 0.5;
    const health = 1 - severity;
    return {
        severity: Math.round(severity * 100) / 100,
        health: Math.round(health * 100) / 100
    };
}
exports.calculateChallengeSeverity = calculateChallengeSeverity;
function validateChallengeResponses(responses) {
    const errors = [];
    const warnings = [];
    let factCount = 0;
    let perceptionCount = 0;
    if (!responses || responses.length === 0) {
        errors.push('No responses provided');
        return {
            isValid: false,
            score: 0,
            errors,
            warnings,
            factVsPerceptionBreakdown: { factBased: 0, perceptionBased: 0 }
        };
    }
    responses.forEach((resp, idx) => {
        // Validate required fields
        if (!resp.responderId)
            errors.push(`Response ${idx}: Missing responderId`);
        if (!resp.role)
            errors.push(`Response ${idx}: Missing respondent role`);
        if (!resp.email)
            errors.push(`Response ${idx}: Missing respondent email`);
        if (!resp.challengeId)
            errors.push(`Response ${idx}: Missing challengeId`);
        // Validate responses
        Object.entries(resp.responses).forEach(([qKey, q]) => {
            // Track fact vs perception
            if (q.isFact) {
                factCount++;
                if (!q.factSource) {
                    warnings.push(`Response ${idx}, ${qKey}: Fact-based answer missing data source`);
                }
            }
            else {
                perceptionCount++;
            }
            // Validate option range
            if (q.selectedOption < 1 || q.selectedOption > q.maxOption) {
                errors.push(`Response ${idx}, ${qKey}: Invalid option ${q.selectedOption} (range: 1-${q.maxOption})`);
            }
            // Validate required question fields
            if (!q.text)
                errors.push(`Response ${idx}, ${qKey}: Missing question text`);
            if (q.maxOption < 1)
                errors.push(`Response ${idx}, ${qKey}: Invalid maxOption`);
        });
    });
    const isValid = errors.length === 0;
    const score = isValid ? 100 : Math.max(0, 100 - errors.length * 10);
    return {
        isValid,
        score,
        errors,
        warnings,
        factVsPerceptionBreakdown: {
            factBased: factCount,
            perceptionBased: perceptionCount
        }
    };
}
exports.validateChallengeResponses = validateChallengeResponses;
/**
 * Export all calculation functions for testing
 */
exports.FirstOpinionCalculations = {
    calculateSsub,
    calculateMobj,
    calculateHealthIndex,
    getHealthStatus,
    calculateGapAndQuadrant,
    calculateAllScores,
    calculateChallengeSeverity,
    validateChallengeResponses
};
//# sourceMappingURL=calculations.js.map
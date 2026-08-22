/**
 * DISHA First Opinion Engine - Core Calculation Engines
 * GENERATED: Verbatim copy from src/lib/firstOpinion/calculations.ts
 * DO NOT EDIT DIRECTLY - Sync via drift-guard test in root Vitest suite
 * Last synced: 2026-08-22
 *
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
/**
 * Response structure for a single question
 */
export interface QuestionResponse {
    text: string;
    selectedOption: number;
    maxOption: number;
    isFact: boolean;
    factSource?: string;
}
/**
 * Challenge response from a respondent
 */
export interface ChallengeResponse {
    id?: string;
    challengeId: string;
    responderId: string;
    role: 'TEACHER' | 'PARENT' | 'STUDENT' | 'ADMIN' | 'OTHER';
    email: string;
    schoolId: string;
    cycleId: string;
    responses: Record<string, QuestionResponse>;
    challenge: {
        title: string;
        domain: string;
        weight: number;
        description: string;
    };
    submittedAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
}
/**
 * Objective multiplier value
 */
export interface Multiplier {
    id: string;
    name: string;
    category: 'CORE' | 'EXPANDED';
    value: number;
    validationStatus: 'VALID' | 'MISSING' | 'OUTLIER' | 'PENDING';
    validationError?: string;
    updatedAt?: Date;
}
/**
 * Calculation result
 */
export interface CalculationResult {
    s_sub: number;
    m_obj: number;
    healthIndex: number;
    gap: number;
    quadrant: 'REALITY_BETTER' | 'ALIGNED' | 'PERCEPTION_BETTER';
    interpretation: string;
    delusionPenalty: number;
}
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
export declare function calculateSsub(responses: ChallengeResponse[], weights: Record<string, number>): number;
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
export declare function calculateMobj(multipliers: Multiplier[]): number;
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
export declare function calculateHealthIndex(s_sub: number, m_obj: number): {
    healthIndex: number;
    delusionPenalty: number;
};
/**
 * Get Health Status Label & Color
 */
export declare function getHealthStatus(healthIndex: number): {
    status: string;
    color: string;
    description: string;
    icon: string;
};
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
export declare function calculateGapAndQuadrant(s_sub: number, m_obj: number): {
    gap: number;
    rawGap: number;
    quadrant: 'REALITY_BETTER' | 'ALIGNED' | 'PERCEPTION_BETTER';
    interpretation: string;
    communicationGap: boolean;
    blindSpotRisk: boolean;
};
/**
 * Calculate all scores in one call
 * Used when both S_sub and M_obj are ready
 */
export declare function calculateAllScores(s_sub: number, m_obj: number): CalculationResult;
/**
 * Calculate challenge severity contribution to overall S_sub
 * Used for "Driver" analysis (which challenges drive most concern?)
 */
export declare function calculateChallengeSeverity(responses: ChallengeResponse[], weight: number): {
    severity: number;
    health: number;
};
/**
 * Validation & Fact-vs-Perception Analysis
 * Refinement 4: Data Quality Checks
 */
export interface ValidationResult {
    isValid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
    factVsPerceptionBreakdown: {
        factBased: number;
        perceptionBased: number;
    };
}
export declare function validateChallengeResponses(responses: ChallengeResponse[]): ValidationResult;
/**
 * Export all calculation functions for testing
 */
export declare const FirstOpinionCalculations: {
    calculateSsub: typeof calculateSsub;
    calculateMobj: typeof calculateMobj;
    calculateHealthIndex: typeof calculateHealthIndex;
    getHealthStatus: typeof getHealthStatus;
    calculateGapAndQuadrant: typeof calculateGapAndQuadrant;
    calculateAllScores: typeof calculateAllScores;
    calculateChallengeSeverity: typeof calculateChallengeSeverity;
    validateChallengeResponses: typeof validateChallengeResponses;
};

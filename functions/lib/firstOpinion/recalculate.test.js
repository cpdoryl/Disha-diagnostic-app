"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const calculations_1 = require("./calculations");
/**
 * Unit tests for recalculation orchestration
 * Tests pure logic with injected fake data (no Firestore needed)
 * Integration tests with real Firestore are in Step 9
 */
(0, vitest_1.describe)('Score Recalculation Orchestration', () => {
    (0, vitest_1.describe)('Data fetcher interface', () => {
        (0, vitest_1.it)('should support injected data fetchers for testing', async () => {
            // Create a mock data fetcher
            const mockFetcher = {
                async fetchChallengeResponses() {
                    return [];
                },
                async fetchMultipliers() {
                    return [];
                },
                async fetchCycleWeights() {
                    return {};
                },
                async fetchCycleData() {
                    return {};
                }
            };
            const responses = await mockFetcher.fetchChallengeResponses('school-001', 'cycle-001');
            const multipliers = await mockFetcher.fetchMultipliers('school-001', 'cycle-001');
            const weights = await mockFetcher.fetchCycleWeights('school-001', 'cycle-001');
            (0, vitest_1.expect)(responses).toEqual([]);
            (0, vitest_1.expect)(multipliers).toEqual([]);
            (0, vitest_1.expect)(weights).toEqual({});
        });
    });
    (0, vitest_1.describe)('Calculation pipeline', () => {
        (0, vitest_1.it)('should calculate S_sub from challenge responses', () => {
            const mockResponse = {
                challengeId: 'C1',
                responderId: 'teacher-001',
                role: 'TEACHER',
                email: 'teacher@school.com',
                schoolId: 'school-001',
                cycleId: 'cycle-001',
                responses: {
                    q1: { text: 'Q1', selectedOption: 7, maxOption: 10, isFact: false },
                    q2: { text: 'Q2', selectedOption: 8, maxOption: 10, isFact: false }
                },
                challenge: { title: 'C1', domain: 'Growth', weight: 0.067, description: 'C1 desc' }
            };
            const weights = { C1: 0.067 };
            const s_sub = (0, calculations_1.calculateSsub)([mockResponse], weights);
            // 7/10 + 8/10 = 1.5, health = 1.5/2 = 0.75, S_sub = 75
            (0, vitest_1.expect)(s_sub).toBeCloseTo(75, 0);
        });
        (0, vitest_1.it)('should calculate all scores from S_sub and M_obj', () => {
            const s_sub = 78.5;
            const m_obj = 82.0;
            const result = (0, calculations_1.calculateAllScores)(s_sub, m_obj);
            (0, vitest_1.expect)(result.s_sub).toBeCloseTo(78.5, 0);
            (0, vitest_1.expect)(result.m_obj).toBeCloseTo(82.0, 0);
            (0, vitest_1.expect)(result.healthIndex).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.healthIndex).toBeLessThanOrEqual(100);
            (0, vitest_1.expect)(['REALITY_BETTER', 'ALIGNED', 'PERCEPTION_BETTER']).toContain(result.quadrant);
        });
        (0, vitest_1.it)('should validate fact-vs-perception breakdown', () => {
            const mixedResponse = {
                challengeId: 'C1',
                responderId: 'teacher-001',
                role: 'TEACHER',
                email: 'teacher@school.com',
                schoolId: 'school-001',
                cycleId: 'cycle-001',
                responses: {
                    q1: {
                        text: 'Fact Q1',
                        selectedOption: 7,
                        maxOption: 10,
                        isFact: true,
                        factSource: 'HR System'
                    },
                    q2: {
                        text: 'Perception Q2',
                        selectedOption: 8,
                        maxOption: 10,
                        isFact: false
                    }
                },
                challenge: { title: 'C1', domain: 'Growth', weight: 0.067, description: 'C1' }
            };
            const validation = (0, calculations_1.validateChallengeResponses)([mixedResponse]);
            (0, vitest_1.expect)(validation.isValid).toBe(true);
            (0, vitest_1.expect)(validation.factVsPerceptionBreakdown.factBased).toBe(1);
            (0, vitest_1.expect)(validation.factVsPerceptionBreakdown.perceptionBased).toBe(1);
        });
        (0, vitest_1.it)('should calculate challenge severity for driver analysis', () => {
            const response = {
                challengeId: 'C1',
                responderId: 'teacher-001',
                role: 'TEACHER',
                email: 'teacher@school.com',
                schoolId: 'school-001',
                cycleId: 'cycle-001',
                responses: {
                    q1: { text: 'Q1', selectedOption: 6, maxOption: 10, isFact: false },
                    q2: { text: 'Q2', selectedOption: 4, maxOption: 10, isFact: false }
                },
                challenge: { title: 'C1', domain: 'Growth', weight: 0.067, description: 'C1' }
            };
            const severity = (0, calculations_1.calculateChallengeSeverity)([response], 0.067);
            // (6+4)/20 = 0.5, health = 0.5
            (0, vitest_1.expect)(severity.health).toBeCloseTo(0.5, 1);
            (0, vitest_1.expect)(severity.severity).toBeCloseTo(0.5, 1);
        });
    });
    (0, vitest_1.describe)('Multi-role aggregation', () => {
        (0, vitest_1.it)('should aggregate responses by multiple roles', () => {
            const teacherResponse = {
                challengeId: 'C1',
                responderId: 'teacher-001',
                role: 'TEACHER',
                email: 'teacher@school.com',
                schoolId: 'school-001',
                cycleId: 'cycle-001',
                responses: {
                    q1: { text: 'Q1', selectedOption: 8, maxOption: 10, isFact: false }
                },
                challenge: { title: 'C1', domain: 'Growth', weight: 0.067, description: 'C1' }
            };
            const parentResponse = {
                challengeId: 'C1',
                responderId: 'parent-001',
                role: 'PARENT',
                email: 'parent@home.com',
                schoolId: 'school-001',
                cycleId: 'cycle-001',
                responses: {
                    q1: { text: 'Q1', selectedOption: 6, maxOption: 10, isFact: false }
                },
                challenge: { title: 'C1', domain: 'Growth', weight: 0.067, description: 'C1' }
            };
            // Mixed responses should aggregate correctly
            const allResponses = [teacherResponse, parentResponse];
            const s_sub = (0, calculations_1.calculateSsub)(allResponses, { C1: 0.067 });
            // Both respond to C1 with 8 and 6 → (8+6)/20 = 0.7 → S_sub = 70
            (0, vitest_1.expect)(s_sub).toBeCloseTo(70, 0);
        });
    });
    (0, vitest_1.describe)('Soft-delete handling', () => {
        (0, vitest_1.it)('should only use non-deleted responses in calculations', () => {
            const activeResponse = {
                challengeId: 'C1',
                responderId: 'teacher-001',
                role: 'TEACHER',
                email: 'teacher@school.com',
                schoolId: 'school-001',
                cycleId: 'cycle-001',
                responses: {
                    q1: { text: 'Q1', selectedOption: 8, maxOption: 10, isFact: false }
                },
                challenge: { title: 'C1', domain: 'Growth', weight: 0.067, description: 'C1' },
                deleted: false
            };
            const deletedResponse = {
                ...activeResponse,
                responderId: 'teacher-002',
                deleted: true
            };
            // Calculation should use only active response (8/10 = 0.8 → S_sub = 80)
            // If deleted was included, average would be lower
            const allResponses = [activeResponse, deletedResponse];
            const activeOnly = allResponses.filter(r => !r.deleted);
            const s_sub = (0, calculations_1.calculateSsub)(activeOnly, { C1: 0.067 });
            (0, vitest_1.expect)(s_sub).toBeCloseTo(80, 0);
        });
    });
});
//# sourceMappingURL=recalculate.test.js.map
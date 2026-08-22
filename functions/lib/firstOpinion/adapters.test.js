"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const adapters_1 = require("./adapters");
/**
 * Unit tests for data adapters (Firestore → Calculation types)
 * Tests pure conversion logic without Firestore connection
 */
(0, vitest_1.describe)('Firestore Adapters', () => {
    (0, vitest_1.describe)('toCalcChallengeResponse', () => {
        (0, vitest_1.it)('should convert Firestore timestamp to Date', () => {
            // Mock Firestore document with Timestamp
            const now = new Date();
            const firestoreDoc = {
                id: 'response-001',
                challengeId: 'C1',
                responderId: 'teacher-001',
                role: 'TEACHER',
                email: 'teacher@school.com',
                schoolId: 'school-001',
                cycleId: 'cycle-001',
                responses: {
                    q1: { text: 'question 1', selectedOption: 7, maxOption: 10, isFact: false }
                },
                challenge: { title: 'Admission Trend', domain: 'Growth', weight: 0.067 },
                submittedAt: { toDate: () => now },
                updatedAt: { toDate: () => now },
                deleted: false
            };
            const result = (0, adapters_1.toCalcChallengeResponse)(firestoreDoc);
            (0, vitest_1.expect)(result.id).toBe('response-001');
            (0, vitest_1.expect)(result.submittedAt).toEqual(now);
            (0, vitest_1.expect)(result.updatedAt).toEqual(now);
            (0, vitest_1.expect)(result.submittedAt instanceof Date).toBe(true);
        });
        (0, vitest_1.it)('should handle missing timestamps gracefully', () => {
            const firestoreDoc = {
                id: 'response-002',
                challengeId: 'C2',
                responderId: 'parent-001',
                role: 'PARENT',
                email: 'parent@email.com',
                schoolId: 'school-001',
                cycleId: 'cycle-001',
                responses: {},
                challenge: {}
                // No submittedAt/updatedAt
            };
            const result = (0, adapters_1.toCalcChallengeResponse)(firestoreDoc);
            (0, vitest_1.expect)(result.submittedAt instanceof Date).toBe(true);
            (0, vitest_1.expect)(result.updatedAt instanceof Date).toBe(true);
            (0, vitest_1.expect)(result.deleted).toBe(false);
        });
        (0, vitest_1.it)('should preserve all required fields', () => {
            const firestoreDoc = {
                id: 'response-003',
                challengeId: 'C3',
                responderId: 'student-001',
                role: 'STUDENT',
                email: 'student@email.com',
                schoolId: 'school-001',
                cycleId: 'cycle-001',
                responses: { q1: { text: 'Q1', selectedOption: 5, maxOption: 10, isFact: true, factSource: 'HR System' } },
                challenge: { title: 'Retention', domain: 'Growth', weight: 0.067, description: 'Retention rate' },
                submittedAt: { toDate: () => new Date() },
                updatedAt: { toDate: () => new Date() },
                deleted: true
            };
            const result = (0, adapters_1.toCalcChallengeResponse)(firestoreDoc);
            (0, vitest_1.expect)(result.challengeId).toBe('C3');
            (0, vitest_1.expect)(result.role).toBe('STUDENT');
            (0, vitest_1.expect)(result.schoolId).toBe('school-001');
            (0, vitest_1.expect)(result.deleted).toBe(true);
            (0, vitest_1.expect)(result.responses.q1.isFact).toBe(true);
            (0, vitest_1.expect)(result.responses.q1.factSource).toBe('HR System');
        });
    });
    (0, vitest_1.describe)('toCalcMultiplier', () => {
        (0, vitest_1.it)('should convert Firestore multiplier with timestamp', () => {
            const now = new Date();
            const firestoreDoc = {
                id: 'M1',
                name: 'Student Teacher Ratio',
                category: 'CORE',
                value: 0.8,
                validationStatus: 'VALID',
                updatedAt: { toDate: () => now }
            };
            const result = (0, adapters_1.toCalcMultiplier)(firestoreDoc);
            (0, vitest_1.expect)(result.id).toBe('M1');
            (0, vitest_1.expect)(result.name).toBe('Student Teacher Ratio');
            (0, vitest_1.expect)(result.value).toBe(0.8);
            (0, vitest_1.expect)(result.validationStatus).toBe('VALID');
            (0, vitest_1.expect)(result.updatedAt).toEqual(now);
        });
        (0, vitest_1.it)('should default missing fields safely', () => {
            const firestoreDoc = {
                id: 'M2',
                name: 'Parent Response SLA'
                // Missing other fields
            };
            const result = (0, adapters_1.toCalcMultiplier)(firestoreDoc);
            (0, vitest_1.expect)(result.id).toBe('M2');
            (0, vitest_1.expect)(result.category).toBeUndefined();
            (0, vitest_1.expect)(result.value).toBe(0); // Defaults to 0
            (0, vitest_1.expect)(result.validationStatus).toBe('PENDING');
            (0, vitest_1.expect)(result.updatedAt instanceof Date).toBe(true);
        });
        (0, vitest_1.it)('should include validation errors when present', () => {
            const firestoreDoc = {
                id: 'M3',
                name: 'Training Hours',
                category: 'CORE',
                value: -0.1,
                validationStatus: 'OUTLIER',
                validationError: 'Value out of range'
            };
            const result = (0, adapters_1.toCalcMultiplier)(firestoreDoc);
            (0, vitest_1.expect)(result.validationError).toBe('Value out of range');
            (0, vitest_1.expect)(result.validationStatus).toBe('OUTLIER');
        });
    });
});
//# sourceMappingURL=adapters.test.js.map
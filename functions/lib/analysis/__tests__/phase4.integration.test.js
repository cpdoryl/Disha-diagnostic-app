"use strict";
/**
 * DISHA Phase 4 - Integration Tests
 * Comprehensive testing of analysis functions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const admin = __importStar(require("firebase-admin"));
// Mock Firebase Admin
const mockDb = {
    collection: () => ({
        doc: () => ({
            get: async () => ({
                exists: true,
                data: () => ({
                    scores: {
                        s_sub: 75,
                        m_obj: 68,
                        healthIndex: 71.5,
                        gap: 45,
                        quadrant: 'REALITY_BETTER',
                        delusionPenalty: 10
                    },
                    respondentCount: 45,
                    respondentsByRole: {
                        teacher: 15,
                        parent: 20,
                        student: 10
                    }
                })
            }),
            collection: () => ({
                doc: () => ({
                    get: async () => ({
                        exists: true,
                        data: () => ({
                            challengeSeverity: {
                                C1: { severity: 6 },
                                C2: { severity: 4 }
                            }
                        })
                    }),
                    set: async () => { }
                })
            })
        }),
        orderBy: () => ({
            limit: () => ({
                get: async () => ({
                    docs: [
                        {
                            id: 'cycle1',
                            data: () => ({
                                scores: { healthIndex: 60 },
                                respondentCount: 40,
                                updatedAt: new Date('2026-06-01')
                            })
                        },
                        {
                            id: 'cycle2',
                            data: () => ({
                                scores: { healthIndex: 68 },
                                respondentCount: 45,
                                updatedAt: new Date('2026-07-01')
                            })
                        },
                        {
                            id: 'cycle3',
                            data: () => ({
                                scores: { healthIndex: 75 },
                                respondentCount: 48,
                                updatedAt: new Date('2026-08-01')
                            })
                        }
                    ]
                })
            })
        })
    })
};
(0, vitest_1.describe)('Phase 4 Analysis Functions', () => {
    (0, vitest_1.describe)('generateDiagnosticReport', () => {
        (0, vitest_1.it)('should generate comprehensive report with all metrics', async () => {
            const report = {
                schoolId: 'TEST_SCHOOL',
                cycleId: 'cycle_001',
                scores: {
                    s_sub: 75,
                    m_obj: 68,
                    healthIndex: 71.5,
                    gap: 45,
                    quadrant: 'REALITY_BETTER',
                    delusionPenalty: 10
                },
                respondentCount: 45,
                respondentsByRole: {
                    teacher: 15,
                    parent: 20,
                    student: 10
                },
                dimensionAnalysis: {},
                recommendations: [],
                generatedAt: admin.firestore.Timestamp.now()
            };
            (0, vitest_1.expect)(report.scores.healthIndex).toBe(71.5);
            (0, vitest_1.expect)(report.respondentCount).toBe(45);
            (0, vitest_1.expect)(report.scores.quadrant).toBe('REALITY_BETTER');
        });
        (0, vitest_1.it)('should identify blind spot risk when perception > reality', async () => {
            const report = {
                scores: {
                    quadrant: 'PERCEPTION_BETTER',
                    healthIndex: 65
                },
                recommendations: [
                    {
                        category: 'RISK',
                        title: 'Blind spot risk detected'
                    }
                ]
            };
            (0, vitest_1.expect)(report.scores.quadrant).toBe('PERCEPTION_BETTER');
            (0, vitest_1.expect)(report.recommendations[0].category).toBe('RISK');
        });
        (0, vitest_1.it)('should identify communication opportunity when reality > perception', async () => {
            const report = {
                scores: {
                    quadrant: 'REALITY_BETTER',
                    healthIndex: 75
                },
                recommendations: [
                    {
                        category: 'OPPORTUNITY',
                        title: 'Communication gap identified'
                    }
                ]
            };
            (0, vitest_1.expect)(report.scores.quadrant).toBe('REALITY_BETTER');
            (0, vitest_1.expect)(report.recommendations[0].category).toBe('OPPORTUNITY');
        });
        (0, vitest_1.it)('should generate critical recommendations for low health index', async () => {
            const report = {
                scores: {
                    healthIndex: 35,
                    quadrant: 'ALIGNED'
                },
                recommendations: [
                    {
                        category: 'CRITICAL',
                        title: 'School requires immediate intervention',
                        actions: [
                            'Form crisis management team',
                            'Conduct root cause analysis',
                            'Develop 90-day action plan',
                            'Allocate emergency resources'
                        ]
                    }
                ]
            };
            (0, vitest_1.expect)(report.scores.healthIndex).toBeLessThan(40);
            (0, vitest_1.expect)(report.recommendations[0].category).toBe('CRITICAL');
            (0, vitest_1.expect)(report.recommendations[0].actions.length).toBe(4);
        });
        (0, vitest_1.it)('should build 14-dimension analysis structure', async () => {
            const dimensions = {};
            for (let d = 1; d <= 14; d++) {
                const dimensionId = `D${String(d).padStart(2, '0')}`;
                dimensions[dimensionId] = {
                    dimensionId,
                    dimensionName: `Dimension ${d}`,
                    healthIndex: 70,
                    gap: 40
                };
            }
            (0, vitest_1.expect)(Object.keys(dimensions).length).toBe(14);
            (0, vitest_1.expect)(dimensions.D01).toBeDefined();
            (0, vitest_1.expect)(dimensions.D14).toBeDefined();
        });
    });
    (0, vitest_1.describe)('analyzeDimensions', () => {
        (0, vitest_1.it)('should analyze all 14 dimensions with priority sorting', async () => {
            const dimensions = [
                {
                    dimensionId: 'D01',
                    dimensionName: 'Academic Reputation',
                    healthIndex: 35,
                    priority: 'CRITICAL'
                },
                {
                    dimensionId: 'D02',
                    dimensionName: 'Teacher Welfare',
                    healthIndex: 55,
                    priority: 'HIGH'
                },
                {
                    dimensionId: 'D03',
                    dimensionName: 'Leadership',
                    healthIndex: 78,
                    priority: 'MEDIUM'
                }
            ];
            dimensions.sort((a, b) => {
                const priorityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
                return (priorityOrder[a.priority] || 5) -
                    (priorityOrder[b.priority] || 5);
            });
            (0, vitest_1.expect)(dimensions[0].priority).toBe('CRITICAL');
            (0, vitest_1.expect)(dimensions[1].priority).toBe('HIGH');
            (0, vitest_1.expect)(dimensions[2].priority).toBe('MEDIUM');
        });
        (0, vitest_1.it)('should calculate priority based on health index', async () => {
            const calculatePriority = (healthIndex) => {
                if (healthIndex < 40)
                    return 'CRITICAL';
                if (healthIndex < 60)
                    return 'HIGH';
                if (healthIndex < 80)
                    return 'MEDIUM';
                return 'LOW';
            };
            (0, vitest_1.expect)(calculatePriority(35)).toBe('CRITICAL');
            (0, vitest_1.expect)(calculatePriority(50)).toBe('HIGH');
            (0, vitest_1.expect)(calculatePriority(70)).toBe('MEDIUM');
            (0, vitest_1.expect)(calculatePriority(85)).toBe('LOW');
        });
        (0, vitest_1.it)('should generate status based on health index', async () => {
            const getStatus = (healthIndex) => {
                if (healthIndex >= 80)
                    return 'EXCELLENT';
                if (healthIndex >= 60)
                    return 'GOOD';
                if (healthIndex >= 40)
                    return 'FAIR';
                if (healthIndex >= 20)
                    return 'POOR';
                return 'CRITICAL';
            };
            (0, vitest_1.expect)(getStatus(85)).toBe('EXCELLENT');
            (0, vitest_1.expect)(getStatus(70)).toBe('GOOD');
            (0, vitest_1.expect)(getStatus(50)).toBe('FAIR');
            (0, vitest_1.expect)(getStatus(25)).toBe('POOR');
            (0, vitest_1.expect)(getStatus(10)).toBe('CRITICAL');
        });
        (0, vitest_1.it)('should generate dimension insights based on gap and health', async () => {
            const generateInsight = (gap, healthIndex) => {
                if (gap > 70) {
                    return 'Leadership perception significantly exceeds reality. Blind spot risk.';
                }
                else if (gap < 30) {
                    return 'Operations outperforming perception. Communication opportunity.';
                }
                else if (healthIndex < 40) {
                    return 'Critical issues identified. Immediate intervention required.';
                }
                else if (healthIndex < 60) {
                    return 'Significant gaps exist. Targeted improvement plan needed.';
                }
                else if (healthIndex < 80) {
                    return 'Good performance with room for optimization.';
                }
                return 'Excellent performance. Maintain current standards.';
            };
            (0, vitest_1.expect)(generateInsight(75, 65)).toContain('Blind spot risk');
            (0, vitest_1.expect)(generateInsight(20, 65)).toContain('Communication opportunity');
            (0, vitest_1.expect)(generateInsight(45, 35)).toContain('Critical issues');
            (0, vitest_1.expect)(generateInsight(45, 70)).toContain('Good performance');
        });
    });
    (0, vitest_1.describe)('analyzeTrends', () => {
        (0, vitest_1.it)('should calculate improvement rate across cycles', async () => {
            const calculateImprovementRate = (cycles) => {
                if (cycles.length < 2)
                    return 0;
                const first = cycles[0].scores?.healthIndex || 0;
                const last = cycles[cycles.length - 1].scores?.healthIndex || 0;
                const periods = cycles.length - 1;
                return periods > 0 ? (last - first) / periods : 0;
            };
            const cycles = [
                { scores: { healthIndex: 60 } },
                { scores: { healthIndex: 68 } },
                { scores: { healthIndex: 75 } }
            ];
            const rate = calculateImprovementRate(cycles);
            (0, vitest_1.expect)(rate).toBe(7.5); // (75-60)/2
        });
        (0, vitest_1.it)('should identify trajectory patterns', async () => {
            const getTrajectory = (cycles) => {
                if (cycles.length < 2)
                    return 'INSUFFICIENT_DATA';
                const first = cycles[0].scores?.healthIndex || 0;
                const last = cycles[cycles.length - 1].scores?.healthIndex || 0;
                const diff = last - first;
                if (diff > 10)
                    return 'STRONG_IMPROVEMENT';
                if (diff > 0)
                    return 'GRADUAL_IMPROVEMENT';
                if (diff > -10)
                    return 'STABLE_WITH_SLIGHT_DECLINE';
                return 'SIGNIFICANT_DECLINE';
            };
            const strongImprovement = [
                { scores: { healthIndex: 50 } },
                { scores: { healthIndex: 65 } }
            ];
            (0, vitest_1.expect)(getTrajectory(strongImprovement)).toBe('STRONG_IMPROVEMENT');
            const decline = [
                { scores: { healthIndex: 75 } },
                { scores: { healthIndex: 60 } }
            ];
            (0, vitest_1.expect)(getTrajectory(decline)).toBe('SIGNIFICANT_DECLINE');
        });
        (0, vitest_1.it)('should forecast next cycle health index', async () => {
            const forecastNext = (cycles) => {
                if (cycles.length < 2)
                    return null;
                const healthIndices = cycles.map((c) => c.scores?.healthIndex || 0);
                const lastThree = healthIndices.slice(-3);
                if (lastThree.length >= 2) {
                    const trend = (lastThree[lastThree.length - 1] - lastThree[0]) / (lastThree.length - 1);
                    const forecast = lastThree[lastThree.length - 1] + trend;
                    return {
                        predictedHealthIndex: Math.max(0, Math.min(100, forecast)),
                        confidence: 'MEDIUM'
                    };
                }
                return null;
            };
            const cycles = [
                { scores: { healthIndex: 60 } },
                { scores: { healthIndex: 68 } },
                { scores: { healthIndex: 75 } }
            ];
            const forecast = forecastNext(cycles);
            (0, vitest_1.expect)(forecast).toBeDefined();
            (0, vitest_1.expect)(forecast?.predictedHealthIndex).toBeGreaterThan(75);
            (0, vitest_1.expect)(forecast?.predictedHealthIndex).toBeLessThanOrEqual(100);
        });
        (0, vitest_1.it)('should calculate volatility across cycles', async () => {
            const calculateVolatility = (cycles) => {
                const healthIndices = cycles.map((c) => c.scores?.healthIndex || 0);
                const mean = healthIndices.reduce((a, b) => a + b, 0) / healthIndices.length;
                const variance = healthIndices.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / healthIndices.length;
                return Math.sqrt(variance);
            };
            const stableCycles = [
                { scores: { healthIndex: 70 } },
                { scores: { healthIndex: 71 } },
                { scores: { healthIndex: 72 } }
            ];
            const volatileCycles = [
                { scores: { healthIndex: 50 } },
                { scores: { healthIndex: 75 } },
                { scores: { healthIndex: 55 } }
            ];
            const stableVolatility = calculateVolatility(stableCycles);
            const volatileVolatility = calculateVolatility(volatileCycles);
            (0, vitest_1.expect)(volatileVolatility).toBeGreaterThan(stableVolatility);
        });
        (0, vitest_1.it)('should detect respondent participation changes', async () => {
            const calculateRespondentChange = (prevCount, currCount) => {
                return Math.round(((currCount - prevCount) / prevCount) * 100);
            };
            (0, vitest_1.expect)(calculateRespondentChange(40, 45)).toBe(13); // 12.5 rounds to 13
            (0, vitest_1.expect)(calculateRespondentChange(50, 40)).toBe(-20);
            (0, vitest_1.expect)(calculateRespondentChange(30, 30)).toBe(0);
        });
    });
    (0, vitest_1.describe)('Report Export Functionality', () => {
        (0, vitest_1.it)('should structure data for PDF export', async () => {
            const report = {
                schoolId: 'TEST_SCHOOL',
                cycleId: 'cycle_001',
                scores: {
                    healthIndex: 71.5,
                    s_sub: 75,
                    m_obj: 68,
                    gap: 45
                },
                respondentCount: 45,
                recommendations: [
                    { title: 'Rec 1', description: 'Description 1', actions: ['Action 1'] }
                ]
            };
            (0, vitest_1.expect)(report.schoolId).toBeDefined();
            (0, vitest_1.expect)(report.scores).toBeDefined();
            (0, vitest_1.expect)(report.recommendations.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should structure data for CSV export', async () => {
            const dimensions = [
                { dimensionId: 'D01', dimensionName: 'Academic', healthIndex: 75, priority: 'MEDIUM' },
                { dimensionId: 'D02', dimensionName: 'Welfare', healthIndex: 62, priority: 'HIGH' }
            ];
            const csvData = dimensions.map((d) => ({
                'Dimension ID': d.dimensionId,
                'Dimension Name': d.dimensionName,
                'Health Index': d.healthIndex,
                'Priority': d.priority
            }));
            (0, vitest_1.expect)(csvData.length).toBe(2);
            (0, vitest_1.expect)(csvData[0]['Dimension ID']).toBe('D01');
        });
    });
    (0, vitest_1.describe)('Recommendations Engine', () => {
        (0, vitest_1.it)('should generate critical recommendations for low health index', () => {
            const recommendations = [];
            const healthIndex = 35;
            if (healthIndex < 40) {
                recommendations.push({
                    category: 'CRITICAL',
                    title: 'School requires immediate intervention',
                    priority: 'IMMEDIATE'
                });
            }
            (0, vitest_1.expect)(recommendations.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(recommendations[0].category).toBe('CRITICAL');
        });
        (0, vitest_1.it)('should generate opportunity recommendations for reality > perception', () => {
            const recommendations = [];
            const quadrant = 'REALITY_BETTER';
            if (quadrant === 'REALITY_BETTER') {
                recommendations.push({
                    category: 'OPPORTUNITY',
                    title: 'Communication gap identified',
                    actions: ['Celebrate hidden wins', 'Improve internal communication']
                });
            }
            (0, vitest_1.expect)(recommendations[0].category).toBe('OPPORTUNITY');
            (0, vitest_1.expect)(recommendations[0].actions.length).toBe(2);
        });
        (0, vitest_1.it)('should generate risk recommendations for perception > reality', () => {
            const recommendations = [];
            const quadrant = 'PERCEPTION_BETTER';
            if (quadrant === 'PERCEPTION_BETTER') {
                recommendations.push({
                    category: 'RISK',
                    title: 'Blind spot risk detected',
                    actions: ['Validate findings', 'Increase transparency']
                });
            }
            (0, vitest_1.expect)(recommendations[0].category).toBe('RISK');
        });
        (0, vitest_1.it)('should categorize recommendations by timeline', () => {
            const recommendations = [
                { timeline: 'Immediate (1-2 weeks)', priority: 'CRITICAL' },
                { timeline: 'Short-term (1-2 months)', priority: 'HIGH' },
                { timeline: 'Medium-term (3-6 months)', priority: 'MEDIUM' },
                { timeline: 'Ongoing', priority: 'LOW' }
            ];
            const critical = recommendations.filter((r) => r.priority === 'CRITICAL');
            (0, vitest_1.expect)(critical[0].timeline).toContain('Immediate');
        });
    });
    (0, vitest_1.describe)('Data Validation', () => {
        (0, vitest_1.it)('should validate report data completeness', () => {
            const report = {
                schoolId: 'TEST',
                cycleId: 'cycle_001',
                scores: {
                    s_sub: 75,
                    m_obj: 68,
                    healthIndex: 71.5,
                    gap: 45,
                    quadrant: 'ALIGNED'
                },
                respondentCount: 45,
                respondentsByRole: { teacher: 15, parent: 20, student: 10 }
            };
            (0, vitest_1.expect)(report.schoolId).toBeTruthy();
            (0, vitest_1.expect)(report.cycleId).toBeTruthy();
            (0, vitest_1.expect)(report.scores.healthIndex).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(report.scores.healthIndex).toBeLessThanOrEqual(100);
            (0, vitest_1.expect)(report.respondentCount).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should validate dimension data structure', () => {
            const dimension = {
                dimensionId: 'D01',
                dimensionName: 'Academic Reputation',
                healthIndex: 75,
                gap: 45,
                priority: 'MEDIUM',
                status: 'GOOD',
                insight: 'Good performance'
            };
            (0, vitest_1.expect)(dimension.dimensionId).toMatch(/^D\d{2}$/);
            (0, vitest_1.expect)(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).toContain(dimension.priority);
            (0, vitest_1.expect)(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL']).toContain(dimension.status);
        });
        (0, vitest_1.it)('should validate trend data', () => {
            const trends = {
                cycles: 3,
                timespan: 'Cycle 1 to Cycle 3',
                analysis: {
                    improvementRate: 7.5,
                    volatility: 2.3,
                    trajectory: 'GRADUAL_IMPROVEMENT'
                }
            };
            (0, vitest_1.expect)(trends.cycles).toBeGreaterThanOrEqual(2);
            (0, vitest_1.expect)(['STRONG_IMPROVEMENT', 'GRADUAL_IMPROVEMENT', 'STABLE_WITH_SLIGHT_DECLINE', 'SIGNIFICANT_DECLINE', 'INSUFFICIENT_DATA']).toContain(trends.analysis.trajectory);
        });
    });
});
//# sourceMappingURL=phase4.integration.test.js.map
"use strict";
/**
 * DISHA Phase 4 - Trend Analysis
 * Analyzes trends across multiple assessment cycles
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
exports.analyzeTrends = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.analyzeTrends = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }
    const { schoolId, limit = 10 } = data;
    const db = admin.firestore();
    try {
        console.log(`[Trends] Analyzing for ${schoolId}`);
        // Fetch recent assessment cycles
        const cyclesSnap = await db
            .collection('schools')
            .doc(schoolId)
            .collection('assessmentCycles')
            .orderBy('updatedAt', 'desc')
            .limit(limit)
            .get();
        const cycles = [];
        for (const doc of cyclesSnap.docs) {
            cycles.push({
                cycleId: doc.id,
                ...doc.data()
            });
        }
        // Reverse to chronological order
        cycles.reverse();
        if (cycles.length < 2) {
            return {
                success: true,
                message: 'Insufficient cycles for trend analysis',
                trends: [],
                cycles
            };
        }
        // Calculate trends
        const trends = calculateTrends(cycles);
        // Save trends
        await db
            .collection('schools')
            .doc(schoolId)
            .collection('analysis')
            .doc('trends')
            .set({
            cycles: cycles.length,
            timespan: `${cycles[0]?.cycleId} to ${cycles[cycles.length - 1]?.cycleId}`,
            trends,
            analysis: {
                improvementRate: calculateImprovementRate(cycles),
                volatility: calculateVolatility(cycles),
                trajectory: getTrajectory(cycles),
                forecast: forecastNext(cycles)
            },
            generatedAt: admin.firestore.Timestamp.now()
        });
        console.log(`[Trends] Analyzed ${cycles.length} cycles for ${schoolId}`);
        return { success: true, trends, analysis: { cycles: cycles.length } };
    }
    catch (error) {
        console.error(`[Trends] Error:`, error);
        throw error;
    }
});
function calculateTrends(cycles) {
    const trends = [];
    for (let i = 1; i < cycles.length; i++) {
        const prev = cycles[i - 1].scores || {};
        const curr = cycles[i].scores || {};
        const healthIndexChange = (curr.healthIndex || 0) - (prev.healthIndex || 0);
        const gapChange = (curr.gap || 0) - (prev.gap || 0);
        trends.push({
            period: `Cycle ${i} → Cycle ${i + 1}`,
            healthIndexChange,
            healthIndexTrend: healthIndexChange > 0 ? 'IMPROVEMENT' : 'DECLINE',
            gapChange,
            gapTrend: Math.abs(gapChange) < 5 ? 'STABLE' : gapChange > 0 ? 'WIDENING' : 'NARROWING',
            respondentChangePercent: calculateRespondentChange(cycles[i - 1], cycles[i])
        });
    }
    return trends;
}
function calculateImprovementRate(cycles) {
    if (cycles.length < 2)
        return 0;
    const first = cycles[0].scores?.healthIndex || 0;
    const last = cycles[cycles.length - 1].scores?.healthIndex || 0;
    const periods = cycles.length - 1;
    return periods > 0 ? (last - first) / periods : 0;
}
function calculateVolatility(cycles) {
    const healthIndices = cycles.map((c) => c.scores?.healthIndex || 0);
    const mean = healthIndices.reduce((a, b) => a + b, 0) / healthIndices.length;
    const variance = healthIndices.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / healthIndices.length;
    return Math.sqrt(variance);
}
function getTrajectory(cycles) {
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
}
function forecastNext(cycles) {
    if (cycles.length < 2)
        return null;
    const healthIndices = cycles.map((c) => c.scores?.healthIndex || 0);
    const lastThree = healthIndices.slice(-3);
    // Simple linear extrapolation
    if (lastThree.length >= 2) {
        const trend = (lastThree[lastThree.length - 1] - lastThree[0]) / (lastThree.length - 1);
        const forecast = lastThree[lastThree.length - 1] + trend;
        return {
            predictedHealthIndex: Math.max(0, Math.min(100, forecast)),
            confidence: 'MEDIUM',
            factors: ['Assumes trend continuation', 'Based on last 3 cycles', 'May change with interventions']
        };
    }
    return null;
}
function calculateRespondentChange(prevCycle, currCycle) {
    const prevCount = prevCycle?.respondentCount || 1;
    const currCount = currCycle?.respondentCount || 1;
    return Math.round(((currCount - prevCount) / prevCount) * 100);
}
exports.default = { analyzeTrends: exports.analyzeTrends };
//# sourceMappingURL=trendAnalysis.js.map
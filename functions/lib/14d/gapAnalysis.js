"use strict";
/**
 * 14-Dimension Diagnostic Framework v2 — Gap Analysis Engine
 * Cloud Function: Analyze perception-reality gaps and identify blind spots
 * Phase 3: Cloud Functions & Analysis
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
exports.isBlindSpot = exports.runGapAnalysis = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Analyze gaps between reality and perception scores
 * Triggered after metric calculation
 */
exports.runGapAnalysis = functions
    .region('us-central1')
    .https.onCall(async (data) => {
    try {
        const { schoolId, assessmentId } = data;
        console.log(`🔍 Running gap analysis for ${assessmentId}...`);
        // Fetch calculated scores
        const scoresDoc = await db
            .collection('schools')
            .doc(schoolId)
            .collection('assessments14D')
            .doc(assessmentId)
            .collection('calculatedScores')
            .doc('latest')
            .get();
        if (!scoresDoc.exists) {
            throw new Error('Calculated scores not found. Run calculateMetrics first.');
        }
        const scores = scoresDoc.data();
        const dimensionScores = scores.dimensionScores;
        // Analyze each gap
        const allGaps = [];
        dimensionScores.forEach((dimension) => {
            const gap = analyzeGap(dimension);
            allGaps.push(gap);
        });
        // Sort by priority
        const sorted = allGaps.sort((a, b) => a.priority - b.priority);
        const topPriorities = sorted.slice(0, 5);
        const blindSpots = allGaps.filter(g => g.type === 'blind_spot');
        const criticalCount = allGaps.filter(g => g.severity === 'CRITICAL').length;
        // Get best and worst performing
        const byReality = [...dimensionScores].sort((a, b) => b.realityScore - a.realityScore);
        const bestPerforming = byReality.slice(0, 3).map(d => ({
            dimension: d.dimensionName,
            score: d.realityScore,
        }));
        const worstPerforming = byReality.slice(-3).map(d => ({
            dimension: d.dimensionName,
            score: d.realityScore,
        }));
        const biggestGaps = sorted
            .slice(0, 5)
            .map(g => ({
            dimension: g.dimensionName,
            gap: g.gap,
        }));
        const result = {
            assessmentId,
            schoolId,
            analyzedAt: admin.firestore.Timestamp.now(),
            totalGaps: allGaps.length,
            criticalGaps: criticalCount,
            blindSpots: blindSpots.length,
            allGaps: sorted,
            topPriorities,
            blindSpotsList: blindSpots,
            summary: {
                bestPerformingDimensions: bestPerforming,
                worstPerformingDimensions: worstPerforming,
                biggestGaps,
            },
        };
        // Save gap analysis
        await db
            .collection('schools')
            .doc(schoolId)
            .collection('assessments14D')
            .doc(assessmentId)
            .collection('analysis')
            .doc('gaps')
            .set(result, { merge: true });
        console.log(`✅ Gap analysis complete`);
        console.log(`   Total gaps: ${allGaps.length}`);
        console.log(`   Critical: ${criticalCount}`);
        console.log(`   Blind spots: ${blindSpots.length}`);
        return result;
    }
    catch (error) {
        console.error('❌ Gap analysis failed:', error);
        throw error;
    }
});
/**
 * Analyze a single dimension's gap
 */
function analyzeGap(dimension) {
    const gap = dimension.gap;
    const direction = dimension.gapDirection;
    const severity = dimension.gapSeverity;
    let type;
    let rootCauses = [];
    let recommendation;
    let priority;
    let urgency;
    if (gap < 5) {
        // Aligned
        type = 'aligned';
        priority = 100;
        urgency = 'LOW';
        recommendation = 'Continue current approach - perception and reality are aligned.';
        rootCauses = ['Strong perception-reality alignment'];
    }
    else if (direction === 'perception_higher') {
        // Perception inflated (people think it's better than it actually is)
        type = 'perception_inflated';
        if (severity === 'CRITICAL') {
            priority = 1;
            urgency = 'IMMEDIATE';
        }
        else if (severity === 'HIGH') {
            priority = 5;
            urgency = 'HIGH';
        }
        else {
            priority = 10;
            urgency = 'MEDIUM';
        }
        rootCauses = [
            'Stakeholder perceptions may not reflect actual performance',
            'Communication gap between implementation and perception',
            'Possible satisfaction bias or survey response bias',
        ];
        recommendation =
            'Bridge perception-reality gap through: (1) Transparent communication about actual performance metrics, (2) Stakeholder education on real data, (3) Address discrepancy drivers.';
    }
    else {
        // Reality lagging (performance is worse than perceived)
        type = 'blind_spot';
        if (severity === 'CRITICAL') {
            priority = 2;
            urgency = 'IMMEDIATE';
        }
        else if (severity === 'HIGH') {
            priority = 4;
            urgency = 'HIGH';
        }
        else {
            priority = 8;
            urgency = 'MEDIUM';
        }
        rootCauses = [
            'Performance not matching stakeholder expectations',
            'Implementation gaps between planned and executed',
            'Resource constraints limiting performance',
            'Capability/skill gaps in execution',
        ];
        recommendation =
            'Urgent improvement needed: (1) Investigate root causes of underperformance, (2) Allocate resources for improvement, (3) Set measurable improvement targets, (4) Monitor progress closely.';
    }
    return {
        dimensionId: dimension.dimensionId,
        dimensionName: dimension.dimensionName,
        realityScore: dimension.realityScore,
        perceptionScore: dimension.perceptionScore,
        gap: Math.round(gap * 100) / 100,
        severity,
        type,
        priority,
        rootCauses,
        recommendation,
        urgency,
    };
}
/**
 * Determine if a gap is a "blind spot"
 * Blind spot = Perception HIGH but Reality DECLINING (from historical data)
 */
function isBlindSpot(currentReality, previousReality, perception) {
    if (!previousReality)
        return false;
    const isPerceptionHigh = perception > 70;
    const isDeclining = currentReality < previousReality;
    return isPerceptionHigh && isDeclining;
}
exports.isBlindSpot = isBlindSpot;
//# sourceMappingURL=gapAnalysis.js.map
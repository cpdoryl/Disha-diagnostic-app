"use strict";
/**
 * 14-Dimension Diagnostic Framework v2 — Metric Calculation
 * Cloud Function: Calculate all metrics and scores for closed assessments
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
exports.calculateMetrics = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const metricCalculations_1 = require("../lib/metricCalculations");
const db = admin.firestore();
/**
 * Calculate all metrics for a closed assessment
 * Triggered when assessment status changes to CLOSED
 */
exports.calculateMetrics = functions
    .region('us-central1')
    .firestore.document('schools/{schoolId}/assessments14D/{assessmentId}')
    .onUpdate(async (change) => {
    try {
        const before = change.before.data();
        const after = change.after.data();
        // Only process if status changed to CLOSED
        if (before?.status === after?.status || after?.status !== 'CLOSED') {
            return;
        }
        const schoolId = change.after.ref.parent.parent.id;
        const assessmentId = change.after.ref.id;
        console.log(`🔄 Calculating metrics for assessment ${assessmentId}...`);
        // Fetch all responses for this assessment
        const responsesSnapshot = await db
            .collection('schools')
            .doc(schoolId)
            .collection('assessments14D')
            .doc(assessmentId)
            .collection('responses')
            .get();
        if (responsesSnapshot.empty) {
            console.warn(`⚠️ No responses found for assessment ${assessmentId}`);
            return;
        }
        const responses = responsesSnapshot.docs.map(doc => doc.data());
        // Group responses by dimension and metric
        const responsesByDimension = new Map();
        const realityByMetric = new Map();
        const perceptionByMetric = new Map();
        responses.forEach(response => {
            // Group by dimension
            if (!responsesByDimension.has(response.dimension)) {
                responsesByDimension.set(response.dimension, []);
            }
            responsesByDimension.get(response.dimension).push(response);
            // Separate reality and perception
            const key = `${response.dimension}_${response.metricId}`;
            if (response.metricType === 'reality') {
                if (!realityByMetric.has(key))
                    realityByMetric.set(key, []);
                realityByMetric.get(key).push(Number(response.metricValue));
            }
            else {
                if (!perceptionByMetric.has(key))
                    perceptionByMetric.set(key, []);
                perceptionByMetric.get(key).push(Number(response.metricValue));
            }
        });
        // Calculate dimension scores
        const dimensionScores = [];
        const realityScores = [];
        const perceptionScores = [];
        for (let dimensionId = 1; dimensionId <= 14; dimensionId++) {
            const dimensionResponses = responsesByDimension.get(dimensionId) || [];
            if (dimensionResponses.length === 0)
                continue;
            // Get reality metrics for this dimension (raw values, not pre-aggregated)
            const realityMetrics = Array.from(realityByMetric.entries())
                .filter(([key]) => key.startsWith(`${dimensionId}_`))
                .flatMap(([, values]) => values);
            // Get perception ratings for this dimension (raw values, not pre-aggregated)
            const perceptionMetrics = Array.from(perceptionByMetric.entries())
                .filter(([key]) => key.startsWith(`${dimensionId}_`))
                .flatMap(([, values]) => values);
            const realityScore = (0, metricCalculations_1.aggregateRealityScore)(realityMetrics);
            const perceptionScore = (0, metricCalculations_1.aggregatePerceptionScore)(perceptionMetrics);
            const { gap, direction, severity } = (0, metricCalculations_1.calculateGap)(realityScore, perceptionScore);
            dimensionScores.push({
                dimensionId,
                dimensionName: getDimensionName(dimensionId),
                realityScore: Math.round(realityScore * 100) / 100,
                perceptionScore: Math.round(perceptionScore * 100) / 100,
                gap: Math.round(gap * 100) / 100,
                gapDirection: direction,
                gapSeverity: severity,
                metricCount: realityMetrics.length,
                respondentCount: new Set(dimensionResponses.map(r => r.respondentId)).size,
            });
            realityScores.push(realityScore);
            perceptionScores.push(perceptionScore);
        }
        // Calculate overall scores
        const overallRealityScore = Math.round((0, metricCalculations_1.aggregateRealityScore)(realityScores) * 100) / 100;
        const overallPerceptionScore = Math.round((0, metricCalculations_1.aggregatePerceptionScore)(perceptionScores) * 100) / 100;
        const { gap: overallGap } = (0, metricCalculations_1.calculateGap)(overallRealityScore, overallPerceptionScore);
        const uniqueRespondents = new Set(responses.map(r => r.respondentId)).size;
        const calculationResult = {
            assessmentId,
            schoolId,
            calculatedAt: admin.firestore.Timestamp.now(),
            dimensionScores,
            overallRealityScore,
            overallPerceptionScore,
            overallGap: Math.round(overallGap * 100) / 100,
            respondentCount: uniqueRespondents,
            responseCount: responses.length,
            metricsCovered: dimensionScores.length,
            analysisReady: true,
        };
        // Save calculation result
        await db
            .collection('schools')
            .doc(schoolId)
            .collection('assessments14D')
            .doc(assessmentId)
            .collection('calculatedScores')
            .doc('latest')
            .set(calculationResult, { merge: true });
        // Update assessment status to ANALYZED
        await db
            .collection('schools')
            .doc(schoolId)
            .collection('assessments14D')
            .doc(assessmentId)
            .update({
            status: 'ANALYZED',
            analyzedAt: admin.firestore.Timestamp.now(),
            'scores.overall': {
                reality: overallRealityScore,
                perception: overallPerceptionScore,
                gap: overallGap,
            },
        });
        console.log(`✅ Metrics calculated for assessment ${assessmentId}`);
        console.log(`   Dimensions: ${dimensionScores.length}`);
        console.log(`   Reality Score: ${overallRealityScore}`);
        console.log(`   Perception Score: ${overallPerceptionScore}`);
        console.log(`   Gap: ${overallGap}`);
    }
    catch (error) {
        console.error('❌ Metric calculation failed:', error);
        throw error;
    }
});
/**
 * Helper: Get dimension name by ID
 */
function getDimensionName(id) {
    const names = {
        1: 'Academic Performance & Learning',
        2: 'Curriculum & Pedagogy',
        3: 'Teacher Quality & Retention',
        4: 'Student Wellbeing',
        5: 'School Infrastructure',
        6: 'Technology Integration',
        7: 'Parental Engagement',
        8: 'Financial Health',
        9: 'Leadership & Governance',
        10: 'Admissions & Enrollment',
        11: 'Alumni Engagement',
        12: 'Operational Efficiency',
        13: 'Diversity & Inclusion',
        14: 'Innovation & Future Readiness',
    };
    return names[id] || `Dimension ${id}`;
}
//# sourceMappingURL=calculateMetrics.js.map
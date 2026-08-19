"use strict";
/**
 * DISHA EWISR Calculate Scores Cloud Function
 * Server-side calculation of assessment scores
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
exports.batchProcessAssessments = exports.calculateScores = exports.calculateOverallHealthIndex = exports.calculateDimensionScores = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Temporary mock data until full implementation
const ALL_DIMENSIONS = Array.from({ length: 14 }, (_, i) => ({
    dimensionId: `D${String(i + 1).padStart(2, '0')}`,
    weight: 7,
    benchmarks: { excellent: 4.5, good: 4.0, average: 3.0, poor: 1.5, needsAttention: 1.5 },
    questions: []
}));
const SCORING_FORMULAS = {
    dimensionScore: (avg) => avg * 20,
    weightedContribution: (score, weight) => (score * weight) / 7
};
/**
 * Calculate dimension scores from assessment responses
 */
const calculateDimensionScores = async (responses) => {
    const scores = [];
    for (const dimension of ALL_DIMENSIONS) {
        const dimensionResponses = responses[dimension.dimensionId];
        if (!dimensionResponses || Object.keys(dimensionResponses).length === 0) {
            scores.push({
                dimensionId: dimension.dimensionId,
                averageWeight: 0,
                score: 0,
                classification: 'Critical'
            });
            continue;
        }
        // Calculate average weight
        const weights = Object.values(dimensionResponses);
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        const averageWeight = totalWeight / weights.length;
        // Convert to 0-100 scale
        const score = SCORING_FORMULAS.dimensionScore(averageWeight);
        // Classify based on benchmark
        let classification = 'Critical';
        if (score >= dimension.benchmarks.excellent) {
            classification = 'Excellent';
        }
        else if (score >= dimension.benchmarks.good) {
            classification = 'Good';
        }
        else if (score >= dimension.benchmarks.average) {
            classification = 'Average';
        }
        else if (score >= dimension.benchmarks.poor) {
            classification = 'Poor';
        }
        else {
            classification = 'Below Average';
        }
        scores.push({
            dimensionId: dimension.dimensionId,
            averageWeight,
            score,
            classification
        });
    }
    return scores;
};
exports.calculateDimensionScores = calculateDimensionScores;
/**
 * Calculate overall health index
 */
const calculateOverallHealthIndex = async (dimensionScores) => {
    const weightedContributions = dimensionScores.map((ds) => {
        const dimension = ALL_DIMENSIONS.find((d) => d.dimensionId === ds.dimensionId);
        if (!dimension)
            return 0;
        return SCORING_FORMULAS.weightedContribution(ds.score, dimension.weight);
    });
    const totalWeight = ALL_DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);
    const overallScore = SCORING_FORMULAS.overallHealthIndex(weightedContributions, totalWeight);
    return Math.min(100, Math.max(0, overallScore));
};
exports.calculateOverallHealthIndex = calculateOverallHealthIndex;
/**
 * HTTP Cloud Function to calculate scores
 */
exports.calculateScores = functions.https.onCall(async (data, context) => {
    try {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const { assessmentId, responses } = data;
        if (!assessmentId || !responses) {
            throw new functions.https.HttpsError('invalid-argument', 'assessmentId and responses are required');
        }
        // Calculate dimension scores
        const dimensionScores = await (0, exports.calculateDimensionScores)(responses);
        // Calculate overall health index
        const overallHealthIndex = await (0, exports.calculateOverallHealthIndex)(dimensionScores);
        // Determine health status
        let healthStatus = 'UNKNOWN';
        if (overallHealthIndex >= 90) {
            healthStatus = 'ELITE EXCELLENCE';
        }
        else if (overallHealthIndex >= 80) {
            healthStatus = 'STRONG PERFORMER';
        }
        else if (overallHealthIndex >= 70) {
            healthStatus = 'HEALTHY SCHOOL';
        }
        else if (overallHealthIndex >= 60) {
            healthStatus = 'AVERAGE PERFORMER';
        }
        else if (overallHealthIndex >= 50) {
            healthStatus = 'BELOW AVERAGE';
        }
        else {
            healthStatus = 'NEEDS SIGNIFICANT IMPROVEMENT';
        }
        // Update assessment document with calculated scores
        const db = admin.firestore();
        const assessmentRef = db.collection('ewisr_assessments').doc(assessmentId);
        const dimensionScoresObj = dimensionScores.reduce((acc, ds) => ({
            ...acc,
            [ds.dimensionId]: {
                score: ds.score,
                classification: ds.classification,
                averageWeight: ds.averageWeight
            }
        }), {});
        await assessmentRef.update({
            dimensionScores: dimensionScoresObj,
            overallHealthIndex,
            healthStatus,
            completionPercentage: calculateCompletionPercentage(responses),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return {
            success: true,
            dimensionScores,
            overallHealthIndex,
            healthStatus
        };
    }
    catch (error) {
        console.error('Error calculating scores:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Error calculating assessment scores: ' + error.message);
    }
});
/**
 * Calculate completion percentage
 */
const calculateCompletionPercentage = (responses) => {
    const totalQuestions = ALL_DIMENSIONS.reduce((sum, d) => sum + d.questions.length, 0);
    let answeredCount = 0;
    for (const dimensionId in responses) {
        answeredCount += Object.keys(responses[dimensionId]).length;
    }
    return Math.round((answeredCount / totalQuestions) * 100);
};
/**
 * Batch process assessments (scheduled function)
 */
exports.batchProcessAssessments = functions.pubsub
    .schedule('every 1 hours')
    .onRun(async () => {
    try {
        const db = admin.firestore();
        // Get all draft assessments that haven't been updated in the last 24 hours
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const draftAssessments = await db
            .collection('ewisr_assessments')
            .where('status', '==', 'draft')
            .where('updatedAt', '<', cutoffTime)
            .limit(100)
            .get();
        let processedCount = 0;
        for (const doc of draftAssessments.docs) {
            const assessment = doc.data();
            if (Object.keys(assessment.responses).length > 0) {
                const dimensionScores = await (0, exports.calculateDimensionScores)(assessment.responses);
                const overallHealthIndex = await (0, exports.calculateOverallHealthIndex)(dimensionScores);
                await doc.ref.update({
                    dimensionScores: dimensionScores.reduce((acc, ds) => ({
                        ...acc,
                        [ds.dimensionId]: {
                            score: ds.score,
                            classification: ds.classification
                        }
                    }), {}),
                    overallHealthIndex,
                    completionPercentage: calculateCompletionPercentage(assessment.responses)
                });
                processedCount++;
            }
        }
        console.log(`Batch processed ${processedCount} assessments`);
        return { processedCount };
    }
    catch (error) {
        console.error('Error in batch process:', error);
        throw error;
    }
});
exports.default = {
    calculateScores: exports.calculateScores,
    calculateDimensionScores: exports.calculateDimensionScores,
    calculateOverallHealthIndex: exports.calculateOverallHealthIndex,
    batchProcessAssessments: exports.batchProcessAssessments
};
//# sourceMappingURL=calculateScores.js.map